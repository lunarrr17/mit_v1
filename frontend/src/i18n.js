import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      navbar: {
        home: "Homepage", tech: "Technology", about: "About Us", menu: "Main Menu", resources: "Resources", contact: "Contact Us",
        overview: "Overview", lab: "AI Screening Lab"
      },
      hero: { line1: "Health.", line2: "Meets.", line3: "ML+AI.", learn: "LEARN MORE" },
      val: {
        t1: "Accuracy & Precision", d1: "We prioritize high-fidelity AI models to deliver the most reliable, deterministic scanning for child malnutrition symptoms.",
        t2: "Early Detection", d2: "By leveraging ML and computer vision, we provide rapid screening workflows to ensure no child slips through the cracks.",
        join: "INTERESTED IN JOINING?"
      },
      time: {
        intro: "Building trust and forging lasting partnerships through innovative design.",
        p1: "Phase 1", d1: "Developing state-of-the-art ResNet18 and YOLOv8 models capable of detecting severe clinical signs and global malnutrition from photographs.",
        p2: "Phase 2", d2: "Integrating with the standard WHO LMS Growth Standards to deterministically fuse clinical z-scores with visual AI predictions.",
        p3: "Phase 3", d3: "NutriScan continues to push boundaries, leveraging computer vision and edge computing to eradicate child malnutrition efficiently."
      },
      vis: {
        img1: "Rapid Diagnostic Solutions", img2: "AI Vision Infrastructure",
        text: "Our vision is to eradicate child malnutrition by empowering clinicians with AI-driven diagnostic insights."
      },
      team: {
        title: "Meet Our Team", core: "CORE MEMBERS", lead: "LEADERSHIP", eng: "ENGINEERING"
      }
    }
  },
  hi: {
    translation: {
      navbar: {
        home: "होमपेज", tech: "तकनीक", about: "हमारे बारे में", menu: "मुख्य मेनू", resources: "संसाधन", contact: "संपर्क करें",
        overview: "अवलोकन", lab: "AI लैब"
      },
      hero: { line1: "स्वास्थ्य।", line2: "तकनीक।", line3: "एआई।", learn: "और जानें" },
      val: {
        t1: "सटीकता", d1: "हम बाल कुपोषण के लक्षणों के लिए सबसे विश्वसनीय स्कैनिंग प्रदान करते हैं।",
        t2: "प्रारंभिक पहचान", d2: "एमएल और कंप्यूटर विजन का लाभ उठाकर, हम तेजी से स्क्रीनिंग वर्कफ़्लो प्रदान करते हैं।",
        join: "शामिल होना चाहते हैं?"
      },
      time: {
        intro: "अभिनव डिजाइन के माध्यम से विश्वास पैदा करना।",
        p1: "चरण 1", d1: "ResNet18 और YOLOv8 मॉडल विकसित करना...",
        p2: "चरण 2", d2: "WHO मानकों के साथ एकीकरण...",
        p3: "चरण 3", d3: "NutriScan सीमाओं को आगे बढ़ाता रहता है..."
      },
      vis: {
        img1: "त्वरित समाधान", img2: "AI विजन",
        text: "हमारा दृष्टिकोण एआई के साथ सशक्त बनाकर बाल कुपोषण को खत्म करना है।"
      },
      team: {
        title: "हमारी टीम", core: "कोर", lead: "नेतृत्व", eng: "इंजीनियरिंग"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
