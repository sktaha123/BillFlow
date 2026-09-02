import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';

// Total display rows in table — matching the physical bill format (20 rows)
const TOTAL_ROWS = 20;

// Shared border style — single crisp 1px solid black border
const BORDER = '1px solid #000000';

export const OfficialBillDocument = React.forwardRef(({
  bill,
  faculty,
  classItem,
  semester,
  academicYear,
  items = [],
  approvals = [],
}, ref) => {
  // Extract signature snapshots from approvals
  const facultyApproval = approvals.find((a) => a.action === 'SUBMITTED');
  const hodApproval    = approvals.find((a) => a.action === 'APPROVED');
  const headApproval   = approvals.find((a) => a.action === 'FINALIZED');

  const facultySignature = facultyApproval?.signature_snapshot_path || faculty?.signature_path;
  const hodSignature     = hodApproval?.signature_snapshot_path;
  const headSignature    = headApproval?.signature_snapshot_path;

  // Compute totals
  let totalSetting     = 0;
  let totalTranslation = 0;
  let totalProof       = 0;

  items.forEach((item) => {
    totalSetting     += Number(item.setting_amount)     || 0;
    totalTranslation += Number(item.translation_amount) || 0;
    totalProof       += Number(item.proof_amount)       || 0;
  });

  const grandTotal    = bill?.grand_total || (totalSetting + totalTranslation + totalProof);
  const amountInWords = bill?.amount_in_words || convertAmountToWords(grandTotal);

  const billDate     = bill?.submission_date ? new Date(bill.submission_date) : new Date();
  const monthYearStr = billDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Clean Session label — ensure no duplication of 'UG / PG - Semester End Examinations'
  let rawSession = semester?.session_type || bill?.session_type || 'Winter Session / Summer Session';
  let cleanSession = rawSession
    .replace(/^UG\s*\/\s*PG\s*-\s*Semester\s*End\s*Examinations\s*\(?/i, '')
    .replace(/\)+$/, '')
    .trim();
  if (!cleanSession) cleanSession = 'Winter Session / Summer Session';

  const hodName  = hodApproval?.user?.name || hodApproval?.user_name || 'Prof. Vinod Rajput';
  const headName = headApproval?.user?.name || headApproval?.user_name || 'Prof. Esmita Gupta';

  // ── Precision cell style factories with explicit line-height and height matching for perfect vertical centering in canvas & PDF ──
  const headerCell = (extra = {}) => ({
    border: BORDER,
    padding: '3px 2px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '1.2',
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    ...extra,
  });

  const bodyCell = (extra = {}) => ({
    border: BORDER,
    padding: '0 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '21px',
    height: '21px',
    color: '#000000',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    ...extra,
  });

  return (
    <div
      ref={ref}
      id="official-bill-document"
      className="print-area bg-white text-black"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '11.5px',
        color: '#000000',
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '12px 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── OUTER BORDER BOX — All 4 sides, uniform 1px solid black border ── */}
      <div style={{ border: BORDER, boxSizing: 'border-box' }}>

        {/* Row 1 — College name */}
        <div style={{
          borderBottom: BORDER,
          textAlign: 'center',
          padding: '6px 8px',
          fontWeight: 'bold',
          fontSize: '13px',
          lineHeight: '1.3',
          letterSpacing: '0.01em',
          color: '#000000',
          backgroundColor: '#ffffff',
        }}>
          B. K. Birla College of Arts, Science &amp; Commerce (Autonomous), Kalyan.
        </div>

        {/* Row 2 — Bill for Paper Setting */}
        <div style={{
          borderBottom: BORDER,
          textAlign: 'center',
          padding: '5px 8px',
          fontWeight: 'bold',
          fontSize: '13.5px',
          lineHeight: '1.3',
          letterSpacing: '0.01em',
          color: '#000000',
          backgroundColor: '#ffffff',
        }}>
          Bill for Paper Setting
        </div>

        {/* Row 3 — UG/PG line (Cleaned, never duplicated) */}
        <div style={{
          borderBottom: BORDER,
          padding: '4px 10px',
          fontSize: '11px',
          lineHeight: '1.3',
          textAlign: 'center',
          color: '#000000',
          backgroundColor: '#ffffff',
        }}>
          UG / PG - Semester End Examinations ({cleanSession})
        </div>

        {/* Row 4 — Semester | Month & Year */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: BORDER,
          fontSize: '11px',
          lineHeight: '1.3',
          color: '#000000',
          backgroundColor: '#ffffff',
          alignItems: 'center',
        }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Semester :</strong>{' '}
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map((r, i) => (
              <span key={r} style={{
                fontWeight: semester?.roman_label === r ? 'bold' : 'normal',
              }}>
                {r}{i < 5 ? ' / ' : ''}
              </span>
            ))}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Month &amp; Year :</strong> {monthYearStr}
          </div>
        </div>

        {/* Row 5 — Department | HOD */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: BORDER,
          fontSize: '11px',
          lineHeight: '1.3',
          color: '#000000',
          backgroundColor: '#ffffff',
          alignItems: 'center',
        }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Name of the Department :</strong>&nbsp;
            {bill?.department || 'Computer Science'}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Name of the HOD:</strong>&nbsp;{hodName}
          </div>
        </div>

        {/* Row 6 — PAPER SETTING banner */}
        <div style={{
          borderBottom: BORDER,
          textAlign: 'center',
          padding: '4px 8px',
          fontWeight: 'bold',
          letterSpacing: '',
          fontSize: '11px',
          lineHeight: '1.3',
          color: '#000000',
          backgroundColor: '#ffffff',
        }}>
          PAPER SETTING
        </div>

        {/* ── TABLE — borderCollapse: collapse, all cells use BORDER consistently ── */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '10.5px',
          tableLayout: 'fixed',
          backgroundColor: '#ffffff',
          color: '#000000',
        }}>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
          </colgroup>

          <thead>
            {/* Header row 1 */}
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th rowSpan={2} style={headerCell()}>Sr.<br />No.</th>
              <th rowSpan={2} style={headerCell()}>Class</th>
              <th rowSpan={2} style={headerCell({ textAlign: 'center' })}>Subject / Course</th>
              <th rowSpan={2} style={headerCell()}>No. of<br />Sets</th>
              <th rowSpan={2} style={headerCell()}>Trans</th>
              <th rowSpan={2} style={headerCell()}>Proof<br />Check</th>
              <th colSpan={3} style={headerCell()}>Amount (Rs.)</th>
              <th rowSpan={2} style={headerCell()}>TOTAL<br />(Rs.)</th>
            </tr>
            {/* Header row 2 */}
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th style={headerCell()}>Paper<br />Sett.</th>
              <th style={headerCell()}>Trans</th>
              <th style={headerCell()}>Proof<br />Checking</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, idx) => {
              const item       = items[idx];
              const isDataRow  = !!item;
              const isPractical = item?.paper_type === 'PRACTICAL';

              const settingCell = isDataRow && item.paper_sets > 0
                ? `${item.setting_rate}×${item.paper_sets}`
                : '';
              const transCell = isDataRow && item.translation_sets > 0
                ? `${item.translation_rate}×${item.translation_sets}`
                : (isDataRow ? '—' : '');
              const proofCell = isDataRow && item.proof_papers > 0
                ? `${item.proof_rate}×${item.proof_papers}`
                : (isDataRow ? '—' : '');

              return (
                <tr key={idx} style={{ height: '21px' }}>
                  <td style={bodyCell()}>{idx + 1}</td>
                  <td style={bodyCell()}>
                    {isDataRow ? (classItem?.name || 'TYCS') : ''}
                  </td>
                  <td style={bodyCell({ textAlign: 'left', padding: '0 4px', textOverflow: 'ellipsis' })}>
                    {isDataRow ? (
                      <>
                        {item.subject?.name || item.subject_name}
                        {isPractical && (
                          <span style={{ fontSize: '9px', marginLeft: 3, opacity: 0.7 }}>(Pract)</span>
                        )}
                      </>
                    ) : ''}
                  </td>
                  <td style={bodyCell()}>
                    {isDataRow && item.paper_sets > 0
                      ? String(item.paper_sets).padStart(2, '0')
                      : ''}
                  </td>
                  <td style={bodyCell()}>
                    {isDataRow ? (item.translation_sets > 0 ? String(item.translation_sets).padStart(2, '0') : '—') : ''}
                  </td>
                  <td style={bodyCell()}>
                    {isDataRow ? (item.proof_papers > 0 ? String(item.proof_papers).padStart(2, '0') : '—') : ''}
                  </td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{settingCell}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{transCell}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{proofCell}</td>
                  <td style={bodyCell({ textAlign: 'right', padding: '0 4px', fontWeight: isDataRow ? 'bold' : 'normal' })}>
                    {isDataRow && item.subtotal > 0 ? `${item.subtotal}/-` : ''}
                  </td>
                </tr>
              );
            })}

            {/* TOTAL row */}
            <tr style={{ fontWeight: 'bold', height: '24px' }}>
              <td
                colSpan={9}
                style={{
                  border: BORDER,
                  textAlign: 'center',
                  padding: '0 4px',
                  lineHeight: '24px',
                  height: '24px',
                  verticalAlign: 'middle',
                  letterSpacing: '0.1em',
                  fontSize: '11px',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                }}
              >
                TOTAL
              </td>
              <td style={{
                border: BORDER,
                textAlign: 'right',
                padding: '0 4px',
                lineHeight: '24px',
                height: '24px',
                verticalAlign: 'middle',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#000000',
                backgroundColor: '#ffffff',
              }}>
                {grandTotal > 0 ? `${grandTotal}/-` : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Amount in Words ── */}
        

      </div>
      {/* ── END OUTER BORDER ── */}

      {/* Page footer */}
      <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10.5px', color: '#000000' }}>
        Page 1
      </div>

      {/* ── SIGNATURE SECTION WITH DIGITAL SNAPSHOTS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        marginTop: '24px',
        gap: '0',
        border: BORDER,
        backgroundColor: '#ffffff',
        color: '#000000',
      }}>

        {/* Faculty Signature Block */}
        <div style={{ textAlign: 'center', padding: '8px 6px', borderRight: BORDER }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {facultySignature ? (
              <img
                src={facultySignature}
                alt="Faculty Signature"
                style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain', filter: 'contrast(1.2)' }}
              />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>[Signature Pending]</span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{faculty?.name || 'Prof. Hemangi Adhiraj'}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Signature of Paper Setter / Examiner</div>
            {facultyApproval && (
              <div style={{ fontSize: '9px', color: '#444', marginTop: '2px', fontFamily: 'monospace' }}>
                {new Date(facultyApproval.created_at).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
        </div>

        {/* HOD Signature Block */}
        <div style={{ textAlign: 'center', padding: '8px 6px', borderRight: BORDER }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {hodSignature ? (
              <img
                src={hodSignature}
                alt="HOD Signature"
                style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain', filter: 'contrast(1.2)' }}
              />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                {bill?.status === 'PENDING_HOD' ? '[Verification Pending]' : '[Signature Pending]'}
              </span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{hodName}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Head of Department (Computer Science)</div>
            {hodApproval && (
              <div style={{ fontSize: '9px', color: '#444', marginTop: '2px', fontFamily: 'monospace' }}>
                {new Date(hodApproval.created_at).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
        </div>

        {/* Principal Signature Block */}
        <div style={{ textAlign: 'center', padding: '8px 6px' }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {headSignature ? (
              <img
                src={headSignature}
                alt="Principal Signature"
                style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain', filter: 'contrast(1.2)' }}
              />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                {bill?.status === 'FINALIZED' ? '[Sanctioned]' : '[Sanction Pending]'}
              </span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{headName}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Director / Principal (Autonomous)</div>
            {headApproval && (
              <div style={{ fontSize: '9px', color: '#444', marginTop: '2px', fontFamily: 'monospace' }}>
                {new Date(headApproval.created_at).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
        </div>

      </div>
      {/* ── END SIGNATURE ── */}

    </div>
  );
});

OfficialBillDocument.displayName = 'OfficialBillDocument';
