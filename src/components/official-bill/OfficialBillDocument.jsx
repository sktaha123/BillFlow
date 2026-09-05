import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';
import { AnswerBookBillDocument } from './AnswerBookBillDocument';
import { PracticalBillDocument } from './PracticalBillDocument';
import { OnlineNepBillDocument } from './OnlineNepBillDocument';

const TOTAL_ROWS = 20;
const BORDER = '1px solid #000000';

export const OfficialBillDocument = React.forwardRef(({
  bill = {},
  faculty = {},
  classItem = {},
  semester = {},
  academicYear = {},
  items = [],
  approvals = [],
}, ref) => {
  const rawMethod = bill?.billing_method || bill?.billingMethod || 'PAPER_SETTING';
  const methodStr = String(rawMethod).toUpperCase().trim();

  let method = 'PAPER_SETTING';
  if (methodStr.includes('ANSWER') || methodStr.includes('MODERAT')) {
    method = 'ANSWER_BOOK_ASSESSMENT';
  } else if (methodStr.includes('PRACTICAL')) {
    method = 'PRACTICAL_ASSESSMENT';
  } else if (methodStr.includes('ONLINE') || methodStr.includes('NEP')) {
    method = 'ONLINE_EXAMINATION_NEP';
  }

  const mergedFaculty = (bill?.faculty && Object.keys(bill.faculty).length > 0) ? bill.faculty : faculty;
  const mergedClass = (bill?.class && Object.keys(bill.class).length > 0) ? bill.class : classItem;
  const mergedSemester = (bill?.semester && Object.keys(bill.semester).length > 0) ? bill.semester : semester;
  const mergedAcademicYear = (bill?.academic_year && Object.keys(bill.academic_year).length > 0) ? bill.academic_year : academicYear;
  const mergedApprovals = (bill?.approvals && bill.approvals.length > 0) ? bill.approvals : (approvals || []);

  const mergedBill = {
    ...bill,
    faculty: mergedFaculty,
    class: mergedClass,
    semester: mergedSemester,
    academic_year: mergedAcademicYear,
    approvals: mergedApprovals,
  };

  if (method === 'ANSWER_BOOK_ASSESSMENT') {
    const itemData = (items && items.length > 0)
      ? items
      : (bill?.answer_book_items && bill.answer_book_items.length > 0
        ? bill.answer_book_items
        : (bill?.items || []));
    return (
      <div ref={ref} id="official-bill-document" className="print-area w-full">
        <AnswerBookBillDocument bill={{ ...mergedBill, answer_book_items: itemData, items: itemData }} />
      </div>
    );
  }

  if (method === 'PRACTICAL_ASSESSMENT') {
    const itemData = (items && items.length > 0)
      ? items
      : (bill?.practical_items && bill.practical_items.length > 0
        ? bill.practical_items
        : (bill?.items || []));
    return (
      <div ref={ref} id="official-bill-document" className="print-area w-full">
        <PracticalBillDocument bill={{ ...mergedBill, practical_items: itemData, items: itemData }} />
      </div>
    );
  }

  if (method === 'ONLINE_EXAMINATION_NEP') {
    const itemData = (items && items.length > 0)
      ? items
      : (bill?.online_items && bill.online_items.length > 0
        ? bill.online_items
        : (bill?.items || []));
    return (
      <div ref={ref} id="official-bill-document" className="print-area w-full">
        <OnlineNepBillDocument bill={{ ...mergedBill, online_items: itemData, items: itemData }} />
      </div>
    );
  }

  // ── PAPER SETTING DEFAULT BILL LAYOUT ──
  const appList = Array.isArray(approvals) ? approvals : (bill?.approvals || []);
  const facultyApproval = appList.find((a) => a && a.action === 'SUBMITTED');
  const hodApproval    = appList.find((a) => a && a.action === 'APPROVED');
  const headApproval   = appList.find((a) => a && a.action === 'FINALIZED');

  const facultySignature = facultyApproval?.signature_snapshot_path || faculty?.signature_path || bill?.faculty?.signature_path;
  const hodSignature     = hodApproval?.signature_snapshot_path;
  const headSignature    = headApproval?.signature_snapshot_path;

  let totalSetting     = 0;
  let totalTranslation = 0;
  let totalProof       = 0;

  const itemList = Array.isArray(items) && items.length > 0 ? items : (bill?.items || []);

  itemList.forEach((item) => {
    if (item) {
      totalSetting     += Number(item.setting_amount)     || 0;
      totalTranslation += Number(item.translation_amount) || 0;
      totalProof       += Number(item.proof_amount)       || 0;
    }
  });

  const grandTotal    = Number(bill?.grand_total) || (totalSetting + totalTranslation + totalProof);

  const billDate     = bill?.submission_date ? new Date(bill.submission_date) : new Date();
  const defaultMonthYear = !isNaN(billDate.getTime()) ? billDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const monthYearStr = bill?.month_year || defaultMonthYear;

  let rawSession = String(semester?.session_type || bill?.session_type || 'Winter Session / Summer Session');
  let cleanSession = rawSession
    .replace(/^UG\s*\/\s*PG\s*-\s*Semester\s*End\s*Examinations\s*\(?/i, '')
    .replace(/\)+$/, '')
    .trim();
  if (!cleanSession) cleanSession = 'Winter Session / Summer Session';

  const hodName  = hodApproval?.user?.name || hodApproval?.user_name || bill?.hod_name || 'Prof. Vinod Rajput';
  const headName = headApproval?.user?.name || headApproval?.user_name || 'Prof. Esmita Gupta';

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

        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '5px 8px', fontWeight: 'bold', fontSize: '13.5px' }}>
          Bill for Paper Setting
        </div>

        <div style={{ borderBottom: BORDER, padding: '4px 10px', fontSize: '11px', textAlign: 'center' }}>
          UG / PG - Semester End Examinations ({cleanSession})
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
            <strong>Month &amp; Year :</strong> {monthYearStr}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER, fontSize: '11px', alignItems: 'center' }}>
          <div style={{ padding: '4px 8px', borderRight: BORDER }}>
            <strong>Name of the Department :</strong>&nbsp;
            {bill?.department || faculty?.department || 'Computer Science'}
          </div>
          <div style={{ padding: '4px 8px' }}>
            <strong>Name of the HOD:</strong>&nbsp;{hodName}
          </div>
        </div>

        <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px' }}>
          PAPER SETTING
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', tableLayout: 'fixed', backgroundColor: '#ffffff', color: '#000000' }}>
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
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <th style={headerCell()}>Paper<br />Sett.</th>
              <th style={headerCell()}>Trans</th>
              <th style={headerCell()}>Proof<br />Checking</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, idx) => {
              const item       = itemList[idx];
              const isDataRow  = !!item;
              const isPractical = item?.paper_type === 'PRACTICAL';

              const settingCell = isDataRow && Number(item.paper_sets) > 0
                ? `${item.setting_rate}×${item.paper_sets}`
                : '';
              const transCell = isDataRow && Number(item.translation_sets) > 0
                ? `${item.translation_rate}×${item.translation_sets}`
                : (isDataRow ? '—' : '');
              const proofCell = isDataRow && Number(item.proof_papers) > 0
                ? `${item.proof_rate}×${item.proof_papers}`
                : (isDataRow ? '—' : '');

              return (
                <tr key={idx} style={{ height: '21px' }}>
                  <td style={bodyCell()}>{idx + 1}</td>
                  <td style={bodyCell()}>
                    {isDataRow ? (item.class_name || classItem?.name || bill?.class?.name || 'TYCS') : ''}
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
                    {isDataRow && Number(item.paper_sets) > 0
                      ? String(item.paper_sets).padStart(2, '0')
                      : ''}
                  </td>
                  <td style={bodyCell()}>
                    {isDataRow ? (Number(item.translation_sets) > 0 ? String(item.translation_sets).padStart(2, '0') : '—') : ''}
                  </td>
                  <td style={bodyCell()}>
                    {isDataRow ? (Number(item.proof_papers) > 0 ? String(item.proof_papers).padStart(2, '0') : '—') : ''}
                  </td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{settingCell}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{transCell}</td>
                  <td style={bodyCell({ fontSize: '9.5px' })}>{proofCell}</td>
                  <td style={bodyCell({ textAlign: 'center', padding: '0 4px', fontWeight: isDataRow ? 'bold' : 'normal' })}>
                    {isDataRow && Number(item.subtotal) > 0 ? `${item.subtotal}/-` : ''}
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

      <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10.5px', color: '#000000' }}>
        Page 1
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: '24px', border: BORDER, backgroundColor: '#ffffff', color: '#000000' }}>
        <div style={{ textAlign: 'center', padding: '8px 6px', borderRight: BORDER }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {facultySignature ? (
              <img src={facultySignature} alt="Faculty Signature" style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>[Signature Pending]</span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{faculty?.name || bill?.faculty?.name || 'Prof. Hemangi Adhiraj'}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Signature of Paper Setter / Examiner</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '8px 6px', borderRight: BORDER }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {hodSignature ? (
              <img src={hodSignature} alt="HOD Signature" style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                {bill?.status === 'PENDING_HOD' ? '[Verification Pending]' : '[Signature Pending]'}
              </span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{hodName}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Head of Department (Computer Science)</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '8px 6px' }}>
          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            {headSignature ? (
              <img src={headSignature} alt="Principal Signature" style={{ maxHeight: '52px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                {bill?.status === 'FINALIZED' ? '[Sanctioned]' : '[Sanction Pending]'}
              </span>
            )}
          </div>
          <div style={{ borderTop: BORDER, paddingTop: '5px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold' }}>{headName}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Director / Principal (Autonomous)</div>
          </div>
        </div>
      </div>
    </div>
  );
});

OfficialBillDocument.displayName = 'OfficialBillDocument';
