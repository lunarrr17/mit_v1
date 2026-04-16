import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FlowBoxes.css';
import { ArrowRight } from 'lucide-react';

const FlowBoxes = ({ isTechFlow = false }) => {
  const { t } = useTranslation();
  
  const steps = isTechFlow ? [
    t('flow.tf1', '1. Data Acquisition'), 
    t('flow.tf2', '2. YOLO Detection'), 
    t('flow.tf3', '3. ResNet Evaluation'), 
    t('flow.tf4', '4. Output Fusion')
  ] : [
    t('flow.step1', '1. Clinical Input'), 
    t('flow.step2', '2. Visual Uploads'), 
    t('flow.step3', '3. AI Assessment'), 
    t('flow.step4', '4. Medical Report')
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className={`flow-container ${isTechFlow ? 'tech-flow' : ''}`}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div 
            className={`flow-box ${idx <= activeStep ? 'filled' : ''}`}
            onMouseEnter={() => setActiveStep(idx)}
            onClick={() => setActiveStep(idx)}
          >
            <div className="flow-fill" style={{ width: idx <= activeStep ? '100%' : '0%' }}></div>
            <span className="flow-text">{step}</span>
          </div>
          {idx < steps.length - 1 && <ArrowRight className="flow-arrow" color={idx < activeStep ? '#1a4bff' : '#cbd5e1'} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FlowBoxes;
