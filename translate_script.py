import os
import re

base_path = 'c:/Users/Lenovo/Desktop/mit_v1/frontend/src'

def replace_in_file(filename, replacements):
    path = os.path.join(base_path, filename)
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "react-i18next" not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content
        # Add const { t } = useTranslation();
        # Looking for things like const Values = () => {
        content = re.sub(r'(const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)', r'\1\n  const { t } = useTranslation();\n', content)

    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Values.jsx
replace_in_file('Values.jsx', [
    ('Accuracy & Precision', '{t("val.t1")}'),
    ('We prioritize high-fidelity AI models to deliver the most reliable, deterministic scanning for child malnutrition symptoms.', '{t("val.d1")}'),
    ('Early Detection', '{t("val.t2")}'),
    ('By leveraging ML and computer vision, we provide rapid screening workflows to ensure no child slips through the cracks.', '{t("val.d2")}'),
    ('INTERESTED IN JOINING?', '{t("val.join")}')
])

# Vision.jsx
replace_in_file('Vision.jsx', [
    ('Rapid Diagnostic Solutions', '{t("vis.img1")}'),
    ('AI Vision Infrastructure', '{t("vis.img2")}'),
    ('Our vision is to eradicate child malnutrition by empowering clinicians with AI-driven diagnostic insights.', '{t("vis.text")}')
])

# Timeline.jsx
replace_in_file('Timeline.jsx', [
    ('Building trust and forging lasting partnerships through innovative design.', '{t("time.intro")}'),
    ('>Phase 1<', '>{t("time.p1")}<'),
    ('Developing state-of-the-art ResNet18 and YOLOv8 models capable of detecting severe clinical signs and global malnutrition from photographs.', '{t("time.d1")}'),
    ('>Phase 2<', '>{t("time.p2")}<'),
    ('Integrating with the standard WHO LMS Growth Standards to deterministically fuse clinical z-scores with visual AI predictions.', '{t("time.d2")}'),
    ('>Phase 3<', '>{t("time.p3")}<'),
    ('NutriScan continues to push boundaries, leveraging computer vision and edge computing to eradicate child malnutrition efficiently.', '{t("time.d3")}')
])

# Team.jsx
replace_in_file('Team.jsx', [
    ('>Meet Our Team<', '>{t("team.title")}<'),
    ('>CORE MEMBERS<', '>{t("team.core")}<'),
    ('{filter}', '{filter === "LEADERSHIP" ? t("team.lead") : t("team.eng")}'),
    ('"LEADERSHIP"', 't("team.lead")'),
    ('"ENGINEERING"', 't("team.eng")')
])

print("Translation replacements completed.")
