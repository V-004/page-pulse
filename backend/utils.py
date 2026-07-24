import time
import re
import urllib3
from urllib.parse import urlparse, urljoin
import requests

# Try importing BeautifulSoup, provide a lightweight HTML parser fallback if not present
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

# Suppress insecure request warnings if SSL fallback is triggered
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ExceptionCustom(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class NonHTMLContentException(ExceptionCustom):
    def __init__(self, message="URL is not an HTML page"):
        super().__init__(message, 415)

class TimeoutException(ExceptionCustom):
    def __init__(self, message="Request timed out"):
        super().__init__(message, 408)

class UnreachableException(ExceptionCustom):
    def __init__(self, message="Unable to reach website"):
        super().__init__(message, 502)

class InvalidURLException(ExceptionCustom):
    def __init__(self, message="Invalid URL"):
        super().__init__(message, 400)


def validate_url(url_str: str) -> str:
    if not url_str or not isinstance(url_str, str):
        raise InvalidURLException("Invalid URL")
    
    url_str = url_str.strip()
    if not url_str.startswith(('http://', 'https://')):
        url_str = 'https://' + url_str

    try:
        parsed = urlparse(url_str)
    except Exception:
        raise InvalidURLException("Invalid URL")

    if not parsed.scheme or not parsed.netloc or parsed.scheme not in ('http', 'https'):
        raise InvalidURLException("Invalid URL")
    
    netloc_host = parsed.netloc.split(':')[0].lower()
    if not netloc_host or ' ' in netloc_host:
        raise InvalidURLException("Invalid URL")
        
    # Domain format validation (localhost, IP address, or standard domain with TLD)
    is_localhost = netloc_host in ('localhost', '127.0.0.1', '::1')
    is_ip = bool(re.match(r'^\d{1,3}(\.\d{1,3}){3}$', netloc_host))
    has_valid_domain = '.' in netloc_host and not netloc_host.startswith('.') and not netloc_host.endswith('.')

    if not (is_localhost or is_ip or has_valid_domain):
        raise InvalidURLException("Invalid URL")
        
    return url_str


def audit_url(target_url: str) -> dict:
    valid_url = validate_url(target_url)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PagePulseAuditor/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
    }

    start_time = time.perf_counter()
    response = None

    try:
        # First attempt standard HTTP request with SSL verification
        try:
            response = requests.get(
                valid_url,
                headers=headers,
                timeout=10,
                allow_redirects=True
            )
        except requests.exceptions.SSLError:
            # Fallback to unverified SSL if target site has misconfigured/self-signed certs
            response = requests.get(
                valid_url,
                headers=headers,
                timeout=10,
                allow_redirects=True,
                verify=False
            )

    except requests.exceptions.Timeout:
        raise TimeoutException("Request timed out")
    except requests.exceptions.TooManyRedirects:
        raise UnreachableException("Too many redirects")
    except (requests.exceptions.ConnectionError, requests.exceptions.URLRequired):
        raise UnreachableException("Unable to reach website")
    except requests.exceptions.InvalidURL:
        raise InvalidURLException("Invalid URL")
    except requests.exceptions.RequestException:
        raise UnreachableException("Unable to reach website")
    except ExceptionCustom as e:
        raise e
    except Exception:
        raise UnreachableException("Unable to reach website")

    end_time = time.perf_counter()
    response_time_ms = int(round((end_time - start_time) * 1000))
    status_code = response.status_code
    content_type = response.headers.get('Content-Type', '').lower()

    # Final URL after redirects for resolving relative paths
    final_url = response.url if response.url else valid_url
    parsed_final = urlparse(final_url)
    default_favicon = f"{parsed_final.scheme}://{parsed_final.netloc}/favicon.ico"

    # Check for PDF or binary extensions / MIME types
    path_lower = parsed_final.path.lower()
    is_pdf_or_media = (
        path_lower.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.gif', '.zip', '.exe', '.mp4')) or
        'application/pdf' in content_type or
        'image/' in content_type or
        'application/zip' in content_type or
        'application/octet-stream' in content_type
    )

    if is_pdf_or_media:
        raise NonHTMLContentException("URL is not an HTML page")

    # Verify Content-Type for non-error responses (< 400) is HTML
    if status_code < 400 and 'text/html' not in content_type and 'application/xhtml+xml' not in content_type:
        raise NonHTMLContentException("URL is not an HTML page")

    raw_bytes = response.content
    page_size_kb = round(len(raw_bytes) / 1024, 2)
    
    try:
        html_content = response.text
    except Exception:
        html_content = ""

    # Final URL after redirects for resolving relative paths (like favicons)
    final_url = response.url if response.url else valid_url
    parsed_final = urlparse(final_url)
    default_favicon = f"{parsed_final.scheme}://{parsed_final.netloc}/favicon.ico"

    # Default extraction values
    page_title = "No Title Found"
    meta_description = "No Meta Description Found"
    h1_count = 0
    images_missing_alt = 0
    total_images = 0
    word_count = 0
    favicon = default_favicon

    if HAS_BS4 and html_content and ('<' in html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Title
        title_tag = soup.find('title')
        if title_tag and title_tag.string:
            title_text = title_tag.string.strip()
            if title_text:
                page_title = title_text
        
        # Meta description
        meta_desc_tag = soup.find('meta', attrs={'name': re.compile(r'^description$', re.I)})
        if not meta_desc_tag:
            meta_desc_tag = soup.find('meta', attrs={'property': re.compile(r'^og:description$', re.I)})
        if not meta_desc_tag:
            meta_desc_tag = soup.find('meta', attrs={'name': re.compile(r'^twitter:description$', re.I)})
            
        if meta_desc_tag and meta_desc_tag.get('content'):
            desc_text = str(meta_desc_tag.get('content', '')).strip()
            if desc_text:
                meta_description = desc_text
                
        # H1 count
        h1_tags = soup.find_all('h1')
        h1_count = len(h1_tags)
        
        # Images missing alt attribute
        img_tags = soup.find_all('img')
        total_images = len(img_tags)
        for img in img_tags:
            alt_val = img.get('alt')
            if alt_val is None or not str(alt_val).strip():
                images_missing_alt += 1

        # Favicon extraction
        icon_link = soup.find('link', attrs={'rel': re.compile(r'^(shortcut )?icon$', re.I)})
        if not icon_link:
            icon_link = soup.find('link', attrs={'rel': re.compile(r'^apple-touch-icon$', re.I)})
        if not icon_link:
            icon_link = soup.find('link', attrs={'rel': re.compile(r'^icon shortcut$', re.I)})

        if icon_link and icon_link.get('href'):
            href = str(icon_link.get('href', '')).strip()
            if href:
                favicon = urljoin(final_url, href)

        # Word count calculation (remove non-visible / non-content elements)
        for element in soup(["script", "style", "noscript", "iframe", "svg", "head", "template"]):
            element.decompose()
            
        text = soup.get_text(separator=' ')
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)

    elif html_content:
        # Fallback simple regex parsing if BS4 is absent
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
        if title_match and title_match.group(1).strip():
            page_title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()

        meta_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html_content, re.IGNORECASE | re.DOTALL)
        if not meta_match:
            meta_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html_content, re.IGNORECASE | re.DOTALL)
        if meta_match and meta_match.group(1).strip():
            meta_description = meta_match.group(1).strip()

        h1_matches = re.findall(r'<h1[^>]*>(.*?)</h1>', html_content, re.IGNORECASE | re.DOTALL)
        h1_count = len(h1_matches)

        img_matches = re.findall(r'<img([^>]+)>', html_content, re.IGNORECASE)
        total_images = len(img_matches)
        for img_attrs in img_matches:
            alt_match = re.search(r'alt=["\'](.*?)["\']', img_attrs, re.IGNORECASE)
            if not alt_match or not alt_match.group(1).strip():
                images_missing_alt += 1

        clean_html = re.sub(r'<(script|style|noscript|iframe|svg|head|template)[^>]*>.*?</\1>', '', html_content, flags=re.IGNORECASE | re.DOTALL)
        clean_text = re.sub(r'<[^>]+>', ' ', clean_html)
        words = re.findall(r'\b\w+\b', clean_text)
        word_count = len(words)

    return {
        "status": status_code,
        "response_time_ms": response_time_ms,
        "page_title": page_title,
        "meta_description": meta_description,
        "h1_count": h1_count,
        "images_missing_alt": images_missing_alt,
        "word_count": word_count,
        "total_images": total_images,
        "page_size_kb": page_size_kb,
        "favicon": favicon
    }
