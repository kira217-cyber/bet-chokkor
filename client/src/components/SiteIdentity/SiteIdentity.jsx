import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSiteIdentify } from "../../features/global/globalSelectors";

/**
 * সাইট-ডেটা থেকে আসা title/favicon ডকুমেন্টে বসায়। কোনো UI রেন্ডার করে না।
 */
const SiteIdentity = () => {
  const siteIdentify = useSelector(selectSiteIdentify);

  useEffect(() => {
    if (siteIdentify?.siteName) {
      document.title = siteIdentify.siteName;
    }

    if (siteIdentify?.favicon) {
      let link = document.querySelector("link[rel='icon']");

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = siteIdentify.favicon;
    }
  }, [siteIdentify]);

  return null;
};

export default SiteIdentity;
