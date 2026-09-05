import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';

const TOTAL_ROWS = 20;
const BORDER = '1px solid #000000';

export function PracticalBillDocument({ bill = {} }) {
  if (!bill) return null;

  const faculty   = bill.faculty || {};
  const items     = (bill.practical_items && bill.practical_items.length > 0)
    ? bill.practical_items
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
  const className   = bill.class_name || bill.class?.name || 'SYCS';

  const headerCell = (extra = {}) => ({
    border: BORDER,
    padding: '4px 2px',
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
    padding: '0 4px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '22px',
    height: '22px',
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
          Bill for Assessment of Answer Practical Examination
        </div>
        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '3px 8px', fontSize: '11px' }}>
          UG / PG - Semester End Examinations (Winter Session / Summer Session)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderBottom: BORDER, fontSize: '11px', alignItems: 'center' }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Semester :</strong>{' '}
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map((r, i) => (
              <span key={r} style={{ fontWeight: (semester?.roman_label || bill?.semester?.roman_label) === r ? 'bold' : 'normal' }}>
                {r}{i < 5 ? ' / ' : ''}
              </span>
            ))}
          </div>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Class:</strong> {className}
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

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', tableLayout: 'fixed', backgroundColor: '#ffffff', color: '#000000' }}>
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '42%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>

          <thead>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th rowSpan={2} style={headerCell()}>Sr.<br />No.</th>
              <th rowSpan={2} style={headerCell({ textAlign: 'left', paddingLeft: '8px' })}>Subject</th>
              <th style={headerCell()}>No. of A'Books</th>
              <th style={headerCell()}>Amount (Rs.)</th>
              <th rowSpan={2} style={headerCell()}>TOTAL<br />(Rs.)</th>
            </tr>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th style={headerCell()}>Practical</th>
              <th style={headerCell()}>Practical</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, idx) => {
              const item = items[idx];
              const isDataRow = !!item;

              const candidates = isDataRow ? Number(item?.practical_books) || 0 : 0;
              const rate       = isDataRow ? Number(item?.practical_rate) || ((item?.level || item?.academic_level) === 'PG' ? 30 : 25) : 25;
              const formula    = isDataRow && candidates > 0 ? `${candidates}×${rate}` : (isDataRow ? '—' : '');

              return (
                <tr key={idx} style={{ height: '22px' }}>
                  <td style={bodyCell()}>{idx + 1}</td>
                  <td style={bodyCell({ textAlign: 'left', padding: '0 8px', textOverflow: 'ellipsis' })}>
                    {isDataRow ? (item.subject?.name || item.subject_name) : ''}
                  </td>
                  <td style={bodyCell()}>{isDataRow ? (candidates > 0 ? candidates : '—') : ''}</td>
                  <td style={bodyCell({ fontSize: '10px' })}>{isDataRow ? formula : ''}</td>
                  <td style={bodyCell({ textAlign: 'center', padding: '0 6px', fontWeight: isDataRow ? 'bold' : 'normal' })}>
                    {isDataRow ? `${item.subtotal}/-` : ''}
                  </td>
                </tr>
              );
            })}

            <tr style={{ fontWeight: 'bold', height: '24px' }}>
              <td colSpan={4} style={{ border: BORDER, textAlign: 'center', padding: '0 4px', lineHeight: '24px', height: '24px', letterSpacing: '0.1em', fontSize: '11px' }}>
                TOTAL
              </td>
              <td style={{ border: BORDER, textAlign: 'center', padding: '0 6px', lineHeight: '24px', height: '24px', fontSize: '11px', fontWeight: 'bold' }}>
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
            <div style={{ fontWeight: 'bold' }}>{faculty?.name || bill?.faculty?.name || 'Examiner'}</div>
            <div style={{ fontSize: '9.5px' }}>Signature of Examiner</div>
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
