import React, { useEffect, useRef } from 'react';
import { Database, Search, Cpu, Layers, FileText, ArrowRight, Shield } from 'lucide-react';
import './TechnologyPage.css';

const TechnologyPage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = containerRef.current?.querySelectorAll('.fade-in-up');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="tech-page" ref={containerRef}>
      <div className="tech-content">
        
        <div className="tech-intro fade-in-up">
          <p className="tech-kicker">NutriScan Ecosystem</p>
          <h1 className="tech-hero-title">Technology & Workflow</h1>
          <p className="tech-subtitle">
            Clinical-grade AI pipelines, explainability layers, and modular healthcare workflows.
          </p>
        </div>

        {/* Narrative & Challenge */}
        <div className="tech-challenge-card fade-in-up">
          <div className="bracket-icon"></div>
          <h2 className="tech-card-title">The Data & Privacy Challenge</h2>
          <p className="tech-card-body">
            Due to strict privacy concerns and a glaring lack of public datasets for malnourished children, we engineered our own custom, proprietary dataset. We utilized rigorous web scraping combined with meticulous manual clinical filtering to curate a high-quality, privacy-compliant dataset of ~800 images, allowing us to train our models strictly from scratch with clinical validity.
          </p>
        </div>

        {/* Visual Workflow Map (Arrow Pipeline matching Homepage Style) */}
        <div className="tech-pipeline-wrapper fade-in-up">
          <h3 className="tech-card-title text-center" style={{marginBottom: '2rem'}}>Pipeline Architecture</h3>
          <div className="tech-pipeline">
            <div className="pipeline-node">
              <Database className="node-icon" size={24} />
              <span className="node-label">Dataset</span>
            </div>
            <ArrowRight className="pipeline-arrow" size={20} />
            <div className="pipeline-node highlight">
              <Search className="node-icon" size={24} />
              <span className="node-label">YOLOv8 ROI</span>
            </div>
            <ArrowRight className="pipeline-arrow" size={20} />
            <div className="pipeline-node highlight">
              <Cpu className="node-icon" size={24} />
              <span className="node-label">ResNet + XAI</span>
            </div>
            <ArrowRight className="pipeline-arrow" size={20} />
            <div className="pipeline-node dual">
              <Layers className="node-icon" size={24} />
              <span className="node-label">Modal Fusion</span>
            </div>
            <ArrowRight className="pipeline-arrow" size={20} />
            <div className="pipeline-node green">
              <FileText className="node-icon" size={24} />
              <span className="node-label">AI Report</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout mimicking Homepage cards */}
        <div className="tech-bento-grid">
          
          <div className="tech-card fade-in-up" style={{ transitionDelay: '0.1s' }}>
            <div className="bracket-icon"></div>
            <p className="tech-accent-label">Computer Vision</p>
            <h3 className="tech-card-title">Step 1: ROI Detection</h3>
            <p className="tech-card-body">
              We deploy a custom-trained <strong>YOLOv8 model</strong> to perform rapid bounding-box detection. Instead of analyzing the entire image indiscriminately, YOLO isolates specific physiological <em>Regions of Interest (ROIs)</em> that clinicians examine: the face (temporal wasting), chest (rib visibility), and arms (muscle mass).
            </p>
          </div>

          <div className="tech-card fade-in-up" style={{ transitionDelay: '0.2s', transform: 'translateY(-1.5rem)' }}>
            <div className="bracket-icon"></div>
            <p className="tech-accent-label">Deep Learning Engine</p>
            <h3 className="tech-card-title">Step 2: Feature Extraction & XAI</h3>
            <p className="tech-card-body">
              Isolated ROIs are passed into a <strong>ResNet-50 architecture</strong> acting as our deep feature extractor to classify malnutrition severity. Crucially, we apply <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) to the output. This provides Explainable AI (XAI) by generating visual heatmaps, showing healthcare workers exactly <em>why</em> the AI made its decision.
            </p>
          </div>

          <div className="tech-card tech-colspan-2 fade-in-up" style={{ transitionDelay: '0.3s' }}>
            <div className="bracket-icon"></div>
            <p className="tech-accent-label">Dual-Signal Architecture</p>
            <h3 className="tech-card-title">Step 3: Multi-Modal Fusion</h3>
            <p className="tech-card-body">
              Visual data alone isn't enough for clinical integrity. We combine the active vision score with manual clinical data entry (Age, Sex, Weight, Height for WHO Z-scores, and MUAC/Edema checks based on the GLIM rule engine). 
            </p>
            
            <div className="tech-fusion-container">
              <div className="tech-fusion-row">
                <span className="fusion-label">Vision Model Pipeline</span>
                <div className="fusion-track"><div className="fusion-fill blue" style={{width: '60%'}}>60%</div></div>
              </div>
              <div className="tech-fusion-row">
                <span className="fusion-label">Clinical Logic Engine</span>
                <div className="fusion-track"><div className="fusion-fill teal" style={{width: '40%'}}>40%</div></div>
              </div>
            </div>
          </div>

          <div className="tech-card tech-colspan-2 fade-in-up" style={{ transitionDelay: '0.4s' }}>
            <div className="bracket-icon"></div>
            <p className="tech-accent-label">Clinical Output</p>
            <h3 className="tech-card-title">Step 4: AI Report Generation</h3>
            <p className="tech-card-body">
              The fused data triggers our automated AI reporting module. It synthesizes complex probabilistic matrices into plain-language clinical summaries, calculates deterministic WHO Z-score trend alerts, and produces immediate actionable referral flags (Red/Amber/Green) optimized for offline ASHA worker interventions.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TechnologyPage;
