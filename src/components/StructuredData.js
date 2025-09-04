import { useEffect } from 'react';

const StructuredData = ({ data }) => {
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

// Predefined structured data for the main website
export const WebsiteStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://cuspark.live/#organization",
        "name": "Chandigarh University - Department of CSE",
        "url": "https://cuspark.live/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cuspark.live/logo192.png"
        },
        "sameAs": [
          "https://www.cuchd.in/"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://cuspark.live/#website",
        "url": "https://cuspark.live/",
        "name": "CuSpark Ideathon",
        "description": "CuSpark Ideathon 2025-26 - Hackathon-style competition for CSE students at Chandigarh University",
        "publisher": {
          "@id": "https://cuspark.live/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Event",
        "name": "CuSpark Ideathon 2025-26",
        "description": "Hackathon-style competition for 1st & 2nd year CSE students",
        "startDate": "2025-09-01",
        "endDate": "2025-12-31",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": "Chandigarh University",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Mohali",
            "addressRegion": "Punjab",
            "addressCountry": "IN"
          }
        },
        "organizer": {
          "@id": "https://cuspark.live/#organization"
        },
        "url": "https://cuspark.live/"
      }
    ]
  };

  return <StructuredData data={structuredData} />;
};

export default StructuredData;
