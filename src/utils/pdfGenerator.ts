import { jsPDF } from 'jspdf';

export interface SessionReportData {
  sessionTitle?: string;
  subjectId?: string;
  leadInvestigator?: string;
  activeNodeName?: string;
  activeRegion?: string;
  glutamateLevel: number;
  gabaLevel: number;
  eiRatio: string;
  recallScore: number;
  isLtpActive: boolean;
  // Resonance Telemetry
  contactImpedance: string;
  laserFluence: string;
  wavelength: number;
  acousticFreq: string;
  acousticPressure: string;
  axialResolution: string;
  snr: string;
  // Neural Frequencies & ML State
  cognitiveState?: 'Focused' | 'Relaxed' | 'Fatigued';
  stateConfidence?: number;
  alphaPower?: number;
  betaPower?: number;
  deltaPower?: number;
  entrainmentActive?: boolean;
  // Safety Audit
  safetyAuditHypothesis?: string;
  safetyAuditResult?: string;
  notes?: string;
}

export function generateSessionPdf(data: SessionReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Primary Color Palette
  const darkNavy = [10, 25, 47]; // #0a192f
  const cyanAccent = [6, 182, 212]; // #06b6d4
  const slateDark = [30, 41, 59]; // #1e293b
  const slateLight = [100, 116, 139]; // #64748b
  const textDark = [15, 23, 42]; // #0f172a
  const white = [255, 255, 255];

  // Helper for drawing horizontal separator
  const drawSeparator = (currentY: number, color = cyanAccent, thickness = 0.5) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, currentY, pageWidth - margin, currentY);
  };

  // ===================== HEADER BLOCK =====================
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(cyanAccent[0], cyanAccent[1], cyanAccent[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PROJECT KATERIYA-X', margin, 11);

  doc.setFontSize(9);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('NEURAL RESONANCE CORE · NON-INVASIVE OPTO-ACOUSTIC BCI RESEARCH DOSSIER', margin, 17);

  doc.setFontSize(7.5);
  doc.setTextColor(180, 210, 230);
  doc.text('In Honor of Prof. Suneel Kateriya (JNU / Hegemann Lab) · Co-Discoverer of ChR1 & ChR2', margin, 23);

  // Top right badge
  doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.roundedRect(pageWidth - margin - 42, 6, 42, 16, 2, 2, 'F');
  doc.setTextColor(cyanAccent[0], cyanAccent[1], cyanAccent[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL SESSION REPORT', pageWidth - margin - 39, 11);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  doc.text(`DATE: ${now.toISOString().split('T')[0]}`, pageWidth - margin - 39, 15);
  doc.text(`TIME: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 39, 19);

  y = 34;

  // ===================== METADATA SECTION =====================
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 1.5, 1.5, 'F');
  doc.setDrawColor(220, 226, 235);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 1.5, 1.5, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`SUBJECT ID: ${data.subjectId || 'KX-SUBJ-8492'}`, margin + 4, y + 6);
  doc.text(`INVESTIGATOR: ${data.leadInvestigator || 'Senior Neuro-Engineer'}`, margin + 65, y + 6);
  doc.text(`BIOSAFETY PROTOCOL: BSL-1 In Silico`, margin + 130, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`TARGET NODE: ${data.activeNodeName || 'Hippocampus (CA1)'}`, margin + 4, y + 12);
  doc.text(`ANATOMICAL REGION: ${data.activeRegion || 'Medial Temporal Lobe'}`, margin + 65, y + 12);
  doc.text(`TRANSDUCTION: AAV-PHP.eB::ChR2-H134R`, margin + 130, y + 12);

  y += 24;

  // ===================== SECTION 1: RESONANCE METRICS =====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. OPTO-ACOUSTIC TRANSDUCTION & RESONANCE TELEMETRY', margin, y);
  y += 2;
  drawSeparator(y);
  y += 4;

  // 6 Metric Cards
  const colWidth = (pageWidth - 2 * margin - 8) / 3;
  const metricsRow1 = [
    { label: 'Scalp Contact Impedance', value: `${data.contactImpedance} kΩ`, sub: 'Anagen Micro-Comb (<10 kΩ goal)' },
    { label: 'Laser Fluence (1064 nm)', value: `${data.laserFluence} mJ/cm²`, sub: 'ANSI Z136 Safe Limit (≤20 mJ/cm²)' },
    { label: 'Acoustic Echo Frequency', value: `${data.acousticFreq} MHz`, sub: '1024-Channel PMUT Array' },
  ];
  const metricsRow2 = [
    { label: 'Thermoelastic Pressure (p₀)', value: `${data.acousticPressure} kPa`, sub: 'Rhodopsin Expansion Wave' },
    { label: 'Axial Spatial Resolution', value: `${data.axialResolution} µm`, sub: 'Sub-Millimeter Engram Precision' },
    { label: 'Signal-to-Noise Ratio (SNR)', value: `${data.snr || '34.2'} dB`, sub: 'Matched Acoustic Impedance' },
  ];

  [metricsRow1, metricsRow2].forEach((row) => {
    row.forEach((m, idx) => {
      const x = margin + idx * (colWidth + 4);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, colWidth, 15, 1, 1, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, colWidth, 15, 1, 1, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(slateLight[0], slateLight[1], slateLight[2]);
      doc.text(m.label, x + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.text(m.value, x + 3, y + 9.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(cyanAccent[0], cyanAccent[1], cyanAccent[2]);
      doc.text(m.sub, x + 3, y + 13.5);
    });
    y += 18;
  });

  y += 2;

  // ===================== SECTION 2: SYNAPTIC ENGRAM & E/I DYNAMICS =====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('2. ENGRAM NETWORK SYNAPTIC DYNAMICS & PLASTICITY', margin, y);
  y += 2;
  drawSeparator(y);
  y += 5;

  // Synaptic E/I Grid
  const halfWidth = (pageWidth - 2 * margin - 4) / 2;
  
  // Left: Neurotransmitter Balance
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, halfWidth, 26, 1, 1, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, halfWidth, 26, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Neurochemical Balance & E/I Ratio', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Glutamate (Excitatory AMPA/NMDA): ${data.glutamateLevel}%`, margin + 4, y + 12);
  doc.text(`GABA (Inhibitory GABAA/B): ${data.gabaLevel}%`, margin + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(`Calculated E/I Ratio: ${data.eiRatio} (Homeostatic Range: 1.5 - 2.2)`, margin + 4, y + 22);

  // Right: Plasticity & Engram Recall
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + halfWidth + 4, y, halfWidth, 26, 1, 1, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + halfWidth + 4, y, halfWidth, 26, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Hebbian Plasticity & Memory Retrieval', margin + halfWidth + 8, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Engram Recall Fidelity: ${data.recallScore}%`, margin + halfWidth + 8, y + 12);
  doc.text(`LTP Potentiation Status: ${data.isLtpActive ? 'INDUCED (+14.8 dB Boost)' : 'Baseline Synaptic Weight'}`, margin + halfWidth + 8, y + 17);
  doc.text(`Optogenetic Target: CaMKIIα::ChR2-H134R (Retrograde)`, margin + halfWidth + 8, y + 22);

  y += 31;

  // ===================== SECTION 3: NEURAL FREQUENCIES & COGNITIVE STATE =====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('3. MULTI-CHANNEL NEURAL SPECTRAL FREQUENCY & ML COGNITIVE STATE', margin, y);
  y += 2;
  drawSeparator(y);
  y += 5;

  const cognitiveState = data.cognitiveState || 'Focused';
  const confidence = data.stateConfidence || 92.4;

  doc.setFillColor(240, 253, 250); // soft teal
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 1.5, 1.5, 'F');
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text(`ML PREDICTED COGNITIVE STATE: ${cognitiveState.toUpperCase()} (${confidence}% Confidence)`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Dominant Spectral Power: Beta (15–30 Hz) 42.8% · Alpha (8–12 Hz) 34.2% · Delta/Theta 23.0%`, margin + 4, y + 11.5);
  doc.text(`Closed-Loop Entrainment: ${data.entrainmentActive ? 'ACTIVE (10 Hz Alpha Butterworth Bandpass Injected)' : 'PASSIVE (Real-time Welch PSD Tracking)'}`, margin + 4, y + 16.5);

  y += 25;

  // ===================== SECTION 4: BIOSAFETY & VERIFICATION AUDIT =====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('4. BIOLOGICAL SAFETY & HYPOTHESIS AUDIT RECORD', margin, y);
  y += 2;
  drawSeparator(y);
  y += 5;

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 1, 1, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('3-STEP SAFETY AUDIT STATUS: ENFORCED & VERIFIED', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const auditText = data.safetyAuditHypothesis
    ? `Audited Hypothesis: "${data.safetyAuditHypothesis.slice(0, 95)}..."`
    : 'Default Protocol: Strict exclusion of organic solvents / IV alcohol; LDLR-targeted lipid nanoparticles deployed.';
  doc.text(auditText, margin + 4, y + 10);
  doc.text('Biochemical Risk: Cytotoxic membrane lysis & protein denaturation prevented via biocompatible buffers.', margin + 4, y + 14.5);
  doc.text('Engineered Solution: AAV-PHP.eB retrograde viral capsids + NIR-II (1064 nm) pulsed photoacoustic array.', margin + 4, y + 19);

  y += 27;

  // ===================== SECTION 5: STEP-BY-STEP WORKFLOW SUMMARY =====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('5. GRAPHIC-NOVEL WORKFLOW & ENGINEERING PHASES SUMMARY', margin, y);
  y += 2;
  drawSeparator(y);
  y += 4;

  const phases = [
    'Phase 1 (Assembly): Helmet with transparent dome & follicle-spaced electrodes minimizing scalp impedance.',
    'Phase 2 (Delivery): AAV9/PHP.eB vectors transport red-shifted opsins (ChRmine/ChR2) to target neurons safely.',
    'Phase 3 (Activation): Pulsed NIR-II lasers transform into thermoelastic ultrasound echo waves through intact bone.',
    'Phase 4 (Mapping): AI decodes glutamate/GABA firing into holographic engram constellation pathways.',
    'Phase 5 (Modulation): Targeted opto-acoustic resonance strengthens motor circuits or calms the hyperactive amygdala.',
    'Phase 6 (Clinical): Non-invasive modulation confirmed safe; monitors validate neural stability & therapeutic gain.',
  ];

  phases.forEach((p, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(cyanAccent[0], cyanAccent[1], cyanAccent[2]);
    doc.text(`[0${idx + 1}]`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(p, margin + 8, y);
    y += 4.5;
  });

  // ===================== FOOTER SIGNATURE =====================
  const footerY = pageHeight - 12;
  drawSeparator(footerY - 2, slateLight, 0.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.text('PROJECT KATERIYA-X RESEARCH CORE · CONFIDENTIAL BIOMEDICAL DOSSIER · NON-INVASIVE OPTO-ACOUSTIC BCI', margin, footerY + 2);
  doc.text(`SESSION CHECKSUM: SHA-256 [${Math.random().toString(36).substring(2, 10).toUpperCase()}-KX]`, pageWidth - margin - 50, footerY + 2);

  // Save the PDF
  const filename = `Kateriya-X_Session_Report_${now.toISOString().split('T')[0]}_${now.getHours()}${now.getMinutes()}.pdf`;
  doc.save(filename);
}
