import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';

const TOTAL_ROWS = 25;
const BORDER = '1px solid #000000';

export function AnswerBookBillDocument({ bill = {} }) {
  if (!bill) return null;

  const faculty   = bill.faculty || {};
  const items     = (bill.answer_book_items && bill.answer_book_items.length > 0)
    ? bill.answer_book_items
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
    lineHeight: '20px',
    height: '20px',
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
          Bill for Assessment of Answer books
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', borderBottom: BORDER, fontSize: '11px', alignItems: 'center' }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Name of the Department :</strong> {department}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Name of the HOD:</strong> {hodName}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', tableLayout: 'fixed', backgroundColor: '#ffffff', color: '#000000' }}>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
          </colgroup>

          <thead>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th rowSpan={2} style={headerCell()}>Sr.<br />No.</th>
              <th rowSpan={2} style={headerCell()}>Class</th>
              <th rowSpan={2} style={headerCell()}>Subject / Course</th>
              <th colSpan={3} style={headerCell()}>No. of A'Book</th>
              <th colSpan={3} style={headerCell()}>Amount (Rs.)</th>
              <th rowSpan={2} style={headerCell()}>Total<br />(Rs.)</th>
            </tr>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th style={headerCell()}>Sem<br />End</th>
              <th style={headerCell()}>ATKT</th>
              <th style={headerCell()}>Int.<br />Ass.</th>
              <th style={headerCell()}>Sem<br />End</th>
              <th style={headerCell()}>ATKT</th>
              <th style={headerCell()}>Int.<br />Ass.</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, idx) => {
              const item = items[idx];
              const isDataRow = !!item;

              const semEndQty = isDataRow ? Number(item?.semester_end_books) || 0 : 0;
              const atktQty   = isDataRow ? Number(item?.atkt_books) || 0 : 0;
              const intQty    = isDataRow ? Number(item?.internal_books) || 0 : 0;

              const semEndRate = isDataRow
                ? (Number(item?.semester_end_rate) || (item?.academic_level === 'MSC' ? 15 : item?.academic_level === 'PG' ? 10 : 8))
                : 8;
              const atktRate   = isDataRow ? (Number(item?.atkt_rate) || semEndRate) : 8;
              const intRate    = isDataRow ? (Number(item?.internal_rate) || 4) : 4;

              const semEndFormula = isDataRow && semEndQty > 0 ? `${semEndQty}×${semEndRate}` : (isDataRow ? '—' : '');
              const atktFormula   = isDataRow && atktQty > 0 ? `${atktQty}×${atktRate}` : (isDataRow ? '—' : '');
              const intFormula    = isDataRow && intQty > 0 ? `${intQty}×${intRate}` : (isDataRow ? '—' : '');

              return (
                <tr key={idx} style={{ height: '20px' }}>
                  <td style={bodyCell()}>{idx + 1}</td>
                  <td style={bodyCell()}>{isDataRow ? (item.class_name || bill.class?.name || 'SYCS') : ''}</td>
                  <td style={bodyCell({ textAlign: 'left', padding: '0 4px', textOverflow: 'ellipsis' })}>
                    {isDataRow ? (item.subject?.name || item.subject_name) : ''}
                  </td>
                  <td style={bodyCell()}>{isDataRow ? (semEndQty > 0 ? semEndQty : '—') : ''}</td>
                  <td style={bodyCell()}>{isDataRow ? (atktQty > 0 ? atktQty : '—') : ''}</td>
                  <td style={bodyCell()}>{isDataRow ? (intQty > 0 ? intQty : '—') : ''}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{isDataRow ? semEndFormula : ''}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{isDataRow ? atktFormula : ''}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{isDataRow ? intFormula : ''}</td>
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
            <div style={{ fontWeight: 'bold' }}>{faculty?.name || bill?.faculty?.name || 'Faculty Member'}</div>
            <div style={{ fontSize: '9.5px' }}>Signature of Paper Setter / Examiner</div>
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
