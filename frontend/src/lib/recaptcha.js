const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
let loading = null;

export const loadRecaptcha = () => {
  if (!SITE_KEY) return Promise.reject(new Error('reCAPTCHA is not configured'));
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      if (window.grecaptcha?.enterprise?.execute) return window.grecaptcha.enterprise.ready(resolve);
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(SITE_KEY)}`;
      s.async = true;
      s.onload = () => window.grecaptcha.enterprise.ready(resolve);
      s.onerror = () => { loading = null; reject(new Error('Could not load reCAPTCHA')); };
      document.head.appendChild(s);
    });
  }
  return loading;
};

export const getRecaptchaToken = async () => {
  if (!SITE_KEY) return null;
  await loadRecaptcha();
  return window.grecaptcha.enterprise.execute(SITE_KEY, { action: 'contact_submit' });
};
