import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';

const TOTAL_ROWS = 20;
const BORDER = '1px solid #000000';

export function OnlineNepBillDocument({ bill = {} }) {
  if (!bill) return null;

  const faculty   = bill.faculty || {};
  const items     = (bill.online_items && bill.online_items.length > 0)
    ? bill.online_items
    : (Array.isArray(bill.items) && bill.items.length > 0 ? bill.items : []);
  const approvals = bill.approvals || [];

  const facultyApproval = approvals.find((a) => a && a.action === 'SUBMITTED');
  const hodApproval    = approvals.find((a) => a && a.action === 'APPROVED');
  const headApproval   = approvals.find((a) => a && a.action === 'FINALIZED');

  const facultySignature = facultyApproval?.signature_snapshot_path || faculty?.signature_path || bill.faculty?.signature_path;
  const hodSignature     = hodApproval?.signature_snapshot_path;
  const headSignature    = headApproval?.signature_snapshot_path;

  const grandTotal    = Number(bill?.grand_total) || items.reduce((sum, it) => sum + (Number(it?.subtotal) || 0), 0);
  const amountInWords = bill?.amount_in_words || convertAmountToWords(grandTotal);

  const semester    = bill.semester || {};
  const defaultMonthYear = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const monthYear   = bill.month_year || defaultMonthYear;
  const department  = bill.department || faculty.department || 'Computer Science';
  const hodName     = bill.hod_name || hodApproval?.user?.name || hodApproval?.user_name || 'Vinod Rajput';

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
      id="official-bill-document"
      className="print-area bg-white text-black"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '11px',
        color: '#000000',
        backgroundColor: '#ffffff',
        width: '100%',
        minWidth: '680px',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '12px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ border: BORDER, boxSizing: 'border-box' }}>
        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '6px 8px', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}>
          B. K. Birla College of Arts, Science &amp; Commerce (Empowered Autonomous Status), Kalyan.
        </div>
        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '4px 8px', fontWeight: 'bold', fontSize: '13.5px' }}>
          Bill for Assessment for Online Examination (NEP)
        </div>
        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '3px 8px', fontSize: '11px' }}>
          UG / PG - Semester End Examinations (Winter Session / Summer Session)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER, fontSize: '11px', alignItems: 'center' }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Semester :</strong>{' '}
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map((r, i) => (
              <span key={r} style={{ fontWeight: (semester?.roman_label || bill?.semester?.roman_label) === r ? 'bold' : 'normal' }}>
                {r}{i < 5 ? ' / ' : ''}
              </span>
            ))}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Month &amp; Year :</strong> {monthYear}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER, fontSize: '11px', alignItems: 'center' }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Name of the Department :</strong> {department}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Name of the HOD:</strong> {hodName}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', tableLayout: 'fixed', backgroundColor: '#ffffff', color: '#000000' }}>
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>

          <thead>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th rowSpan={2} style={headerCell()}>Sr.<br />No.</th>
              <th rowSpan={2} style={headerCell()}>Class</th>
              <th rowSpan={2} style={headerCell()}>Subject / Course</th>
              <th colSpan={2} style={headerCell()}>Total number</th>
              <th colSpan={4} style={headerCell()}>Amount (Rs.)</th>
              <th rowSpan={2} style={headerCell()}>Total<br />(Rs.)<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>(c+d+e+f)</span></th>
            </tr>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th style={headerCell()}>SEE<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>(No. of MCQ) (a)</span></th>
              <th style={headerCell()}>CIA<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>(No. of students) (b)</span></th>
              <th style={headerCell()}>SEE (MCQ)<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>c = (a x Rs.7)</span></th>
              <th style={headerCell()}>Answer Key<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>d = (a x Rs.2)</span></th>
              <th style={headerCell()}>CIA<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>e = (b x Rs.4)</span></th>
              <th style={headerCell()}>Uploading paper<br /><span style={{ fontWeight: 'normal', fontSize: '8px' }}>f = Rs.150</span></th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, idx) => {
              const item = items[idx];
              const isDataRow = !!item;

              const mcqCount     = isDataRow ? Number(item?.mcq_count) || 0 : 0;
              const studentCount = isDataRow ? Number(item?.student_count) || 0 : 0;

              const seeFormula       = isDataRow && mcqCount > 0 ? `7×${mcqCount}` : (isDataRow ? '—' : '');
              const answerKeyFormula = isDataRow && mcqCount > 0 ? `${mcqCount}×2` : (isDataRow ? '—' : '');
              const ciaFormula       = isDataRow && studentCount > 0 ? `${studentCount}×4` : (isDataRow ? '—' : '');
              const uploadFormula    = isDataRow ? '150' : '';

              return (
                <tr key={idx} style={{ height: '21px' }}>
                  <td style={bodyCell()}>{idx + 1}</td>
                  <td style={bodyCell()}>{isDataRow ? (item.class_name || item.class?.name || bill.class?.name || 'FYCS') : ''}</td>
                  <td style={bodyCell({ textAlign: 'left', padding: '0 4px', textOverflow: 'ellipsis' })}>
                    {isDataRow ? (item.subject?.name || item.subject_name) : ''}
                  </td>
                  <td style={bodyCell()}>{isDataRow ? (mcqCount > 0 ? mcqCount : '—') : ''}</td>
                  <td style={bodyCell()}>{isDataRow ? (studentCount > 0 ? studentCount : '—') : ''}</td>
                  <td style={bodyCell({ fontSize: '9px' })}>{isDataRow ? seeFormula : ''}</td>
                  <td style={bodyCell({ fontSize: '9px' })}>{isDataRow ? answerKeyFormula : ''}</td>
                  <td style={bodyCell({ fontSize: '9px' })}>{isDataRow ? ciaFormula : ''}</td>
                  <td style={bodyCell({ fontSize: '9px' })}>{isDataRow ? uploadFormula : ''}</td>
                  <td style={bodyCell({ textAlign: 'center', padding: '0 4px', fontWeight: isDataRow ? 'bold' : 'normal' })}>
                    {isDataRow ? `${item.subtotal}/-` : ''}
                  </td>
                </tr>
              );
            })}

            <tr style={{ fontWeight: 'bold', height: '24px' }}>
              <td colSpan={9} style={{ border: BORDER, textAlign: 'center', padding: '0 4px', lineHeight: '24px', height: '24px', letterSpacing: '0.1em', fontSize: '11px' }}>
                TOTAL
              </td>
              <td style={{ border: BORDER, textAlign: 'center', padding: '0 4px', lineHeight: '24px', height: '24px', fontSize: '11px', fontWeight: 'bold' }}>
                {grandTotal > 0 ? `${grandTotal}/-` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '10px', color: '#000000' }}>
        Page 1
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: '16px', border: BORDER, backgroundColor: '#ffffff', color: '#000000' }}>
        <div style={{ textAlign: 'center', padding: '6px 4px', borderRight: BORDER }}>
          <div style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
            {facultySignature ? (
              <img src={facultySignature} alt="Faculty Signature" style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>[Signature Pending]</span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '4px', fontSize: '10.5px' }}>
            <div style={{ fontWeight: 'bold' }}>{faculty?.name || bill?.faculty?.name || 'Paper Setter'}</div>
            <div style={{ fontSize: '9.5px' }}>Signature of Paper Setter</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '6px 4px', borderRight: BORDER }}>
          <div style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
            {hodSignature ? (
              <img src={hodSignature} alt="HOD Signature" style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>[Verification Pending]</span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '4px', fontSize: '10.5px' }}>
            <div style={{ fontWeight: 'bold' }}>{hodName}</div>
            <div style={{ fontSize: '9.5px' }}>Head of Department</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '6px 4px' }}>
          <div style={{ height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
            {headSignature ? (
              <img src={headSignature} alt="Head Signature" style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>[Sanction Pending]</span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '4px', fontSize: '10.5px' }}>
            <div style={{ fontWeight: 'bold' }}>Prof. Esmita Gupta</div>
            <div style={{ fontSize: '9.5px' }}>Director / Principal</div>
          </div>
        </div>
      </div>
    </div>
  );
}
