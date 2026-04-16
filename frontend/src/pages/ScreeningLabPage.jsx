import { useState, useEffect } from 'react';
import { Upload, AlertCircle, Activity, FileText, Printer, X } from 'lucide-react';
import './Pages.css';
import { analyzeScreening } from '../logic/diagnosis.js';
import { generateReport } from '../logic/report.js';

const ScreeningLabPage = () => {
  const [files, setFiles] = useState({ face: null, front: null, back: null });
  const [previews, setPreviews] = useState({ face: null, front: null, back: null });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [patientInputs, setPatientInputs] = useState({ age: '', sex: 'M', weight: '', height: '', muac: '' });
  const [lmsData, setLmsData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportHtml, setReportHtml] = useState({ __html: '' });

  useEffect(() => {
    fetch('/data/lms.json').then(r => r.json()).then(setLmsData).catch(e => console.error('Failed to load LMS', e));
  }, []);

  const handlePatientChange = (e) => {
    setPatientInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateReport = () => {
    if (!lmsData) {
      alert("Still loading LMS database...");
      return;
    }
    const zScoreResult = analyzeScreening({
      lms: lmsData,
      ageMonths: patientInputs.age,
      weightKg: patientInputs.weight,
      heightCm: patientInputs.height,
      sex: patientInputs.sex,
      muacMm: patientInputs.muac
    });
    
    const report = generateReport(zScoreResult, results?.predict, results?.detect, patientInputs, 'en');
    setReportHtml({ __html: report.html });
    setShowReport(true);
  };


  const handleFileChange = (view, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [view]: file }));
      setPreviews(prev => ({ ...prev, [view]: URL.createObjectURL(file) }));
    }
  };

  const handleAnalyze = async () => {
    if (!files.face && !files.front && !files.back) {
      setError('Please upload at least one image to begin screening.');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);

    const formData = new FormData();
    if (files.face) formData.append('face', files.face);
    if (files.front) formData.append('front', files.front);
    if (files.back) formData.append('back', files.back);

    try {
      const [predictRes, detectRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/predict', { method: 'POST', body: formData }),
        fetch('http://127.0.0.1:5000/detect', { method: 'POST', body: formData })
      ]);
      
      if (!predictRes.ok || !detectRes.ok) {
         throw new Error('Server returned an error.');
      }

      const [predictData, detectData] = await Promise.all([
        predictRes.json(),
        detectRes.json()
      ]);

      setResults({ predict: predictData, detect: detectData });
    } catch (err) {
      setError('Failed to connect to the AI screening servers. Make sure server.py is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="page-card fade-in-up visible">
        <p className="page-kicker">AI Screening Lab</p>
        <h1>Malnutrition Analysis</h1>
        <p>
          Upload patient photos to run real-time dual-pipeline AI screening. 
          The system uses ResNet18 for holistic evaluation and YOLO for localized sign detection.
        </p>

        <div className="clinical-inputs-section">
          <h3>Patient Clinical Inputs</h3>
          <div className="inputs-grid">
            <label>
              <span>Age (Months)</span>
              <input type="number" name="age" value={patientInputs.age} onChange={handlePatientChange} placeholder="e.g. 24" />
            </label>
            <label>
              <span>Sex</span>
              <select name="sex" value={patientInputs.sex} onChange={handlePatientChange}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <label>
              <span>Weight (kg)</span>
              <input type="number" step="0.1" name="weight" value={patientInputs.weight} onChange={handlePatientChange} placeholder="e.g. 10.5" />
            </label>
            <label>
              <span>Height (cm)</span>
              <input type="number" step="0.1" name="height" value={patientInputs.height} onChange={handlePatientChange} placeholder="e.g. 85.0" />
            </label>
            <label>
              <span>MUAC (mm)</span>
              <input type="number" name="muac" value={patientInputs.muac} onChange={handlePatientChange} placeholder="e.g. 120" />
            </label>
          </div>
        </div>

        <div className="upload-grid">
          {['face', 'front', 'back'].map(view => (
            <div key={view} className="upload-card">
              <h4>{view.toUpperCase()} VIEW</h4>
              <div className="upload-area">
                {previews[view] ? (
                  <img src={previews[view]} alt={view} className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={24} color="#6c7482" />
                    <span>Select {view} photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(view, e)} />
              </div>
            </div>
          ))}
        </div>

        {error && <div className="error-banner"><AlertCircle size={16} /> {error}</div>}

        <div className="lab-actions">
          <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}>
            {loading ? <span className="loader"></span> : <Activity size={18} />}
            {loading ? 'ANALYZING...' : 'RUN AI SCREENING'}
          </button>
        </div>

        {results && (
          <div className="results-dashboard">
            <div className="result-header">
              <div style={{ flex: 1 }}>
                <h2>Analysis Results</h2>
                <div className={`severity-pill sev-${results.detect.severity?.replace(/\s+/g, '-') || 'UNKNOWN'}`} style={{ display: 'inline-block', marginTop: '10px' }}>
                  {results.detect.condition} — {results.detect.severity}
                </div>
              </div>
              <button className="btn-generate-report" onClick={handleGenerateReport}>
                <FileText size={18} /> GENERATE REPORT
              </button>
            </div>

            <div className="results-grid">
              <div className="res-panel">
                <h3>Global Diagnosis (ResNet18)</h3>
                <div className="diagnosis-score">
                  <div className="score-ring">
                    {((results.predict.average_probability) * 100).toFixed(1)}%
                  </div>
                  <div>
                    <div className="diag-label">{String(results.predict.final_label).toUpperCase()}</div>
                    <div className="diag-sub">Confidence Score</div>
                  </div>
                </div>
                <div className="view-scores">
                  {results.predict.views?.map(v => (
                    <div key={v.view} className="view-score-item">
                      <span className="v-name">{v.view}</span>
                      <span className={`v-pill ${v.label.toLowerCase() === 'healthy' ? 'safe' : 'warn'}`}>
                        {v.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="res-panel">
                <h3>Detected Clinical Signs (YOLO)</h3>
                <div className="signs-list">
                  {Object.entries(results.detect.views || {}).flatMap(([viewName, viewData]) => 
                    viewData.signs.map((s, i) => (
                      <div key={viewName+i} className="sign-item">
                        <div className="sign-top">
                          <strong>{s.sign.replace(/_/g, ' ')}</strong>
                          {s.verified && <span className="verified-badge">Verified</span>}
                        </div>
                        <p>{s.description}</p>
                      </div>
                    ))
                  )}
                  {results.detect.total_signs === 0 && (
                    <p className="no-signs">No severe malnutrition signs detected.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="gradcam-section">
              <h3>Diagnostic Heatmaps & Annotations</h3>
              <div className="heatmap-grid">
                {results.predict.views?.map(v => v.gradcam_image && (
                  <div key={'gc'+v.view} className="heatmap-card">
                    <img src={`data:image/jpeg;base64,${v.gradcam_image}`} alt={`GradCAM ${v.view}`} />
                    <div className="k">{v.view} Heatmap (AI Focus)</div>
                  </div>
                ))}
                {Object.entries(results.detect.views || {}).map(([viewName, viewData]) => viewData.annotated_image && (
                  <div key={'yl'+viewName} className="heatmap-card">
                    <img src={`data:image/jpeg;base64,${viewData.annotated_image}`} alt={`YOLO ${viewName}`} />
                    <div className="k">{viewName} Detections</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <div className="report-modal-overlay">
          <div className="report-modal-content">
             <div className="report-modal-header">
               <h2>Clinical Screening Report</h2>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={() => window.print()} className="btn-print"><Printer size={16} /> Export PDF / Print</button>
                 <button onClick={() => setShowReport(false)} className="btn-close-modal"><X size={16} /></button>
               </div>
             </div>
             <div className="report-doc-container" dangerouslySetInnerHTML={reportHtml} />
          </div>
        </div>
      )}
    </section>
  );
};
export default ScreeningLabPage;
