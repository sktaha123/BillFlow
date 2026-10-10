import React from 'react';
import { convertAmountToWords } from '@/lib/numberToWords';
import { formatFacultyShortName, formatSubjectWithExamMode } from '@/lib/calculations';

const TOTAL_ROWS = 25;
const BORDER = '1px solid #000000';

export function AnswerBookBillDocument({ bill = {}, isClassWise = false }) {
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
  const hodName     = bill.hod_name || hodApproval?.user?.name || hodApproval?.user_name || 'Prof. Vinod Rajput';
  const facultyName = faculty?.full_name || faculty?.name || bill?.faculty?.full_name || bill?.faculty?.name || '';

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

  const PAGE_1_MAX_WITH_SIGNATURE = 28;
  const SUBSEQUENT_PAGE_MAX = 35;

  let pages = [];
  if (!isClassWise || items.length <= PAGE_1_MAX_WITH_SIGNATURE) {
    const rowCount = isClassWise ? Math.max(25, items.length) : TOTAL_ROWS;
    pages = [{
      pageNumber: 1,
      totalRows: rowCount,
      startIndex: 0,
      isFirstPage: true,
      isLastPage: true,
    }];
  } else {
    pages.push({
      pageNumber: 1,
      totalRows: PAGE_1_MAX_WITH_SIGNATURE,
      startIndex: 0,
      isFirstPage: true,
      isLastPage: false,
    });
    
    let currentIndex = PAGE_1_MAX_WITH_SIGNATURE;
    let pageNum = 2;
    while (currentIndex < items.length) {
      const remainingCount = items.length - currentIndex;
      const countForThisPage = Math.min(remainingCount, SUBSEQUENT_PAGE_MAX);
      const isLast = (currentIndex + countForThisPage) >= items.length;
      pages.push({
        pageNumber: pageNum,
        totalRows: countForThisPage,
        startIndex: currentIndex,
        isFirstPage: false,
        isLastPage: isLast,
      });
      currentIndex += countForThisPage;
      pageNum++;
    }
  }

  return (
    <div
      id="official-bill-document"
      className="print-area official-bill-document"
      data-bill-root
    >
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className={`official-bill-page ${page.isLastPage ? '' : 'has-next-page'}`}
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '11px',
            padding: '10px 14px',
            marginTop: page.pageNumber > 1 ? '24px' : '0px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ border: BORDER, boxSizing: 'border-box' }}>
            {page.isFirstPage && (
              <>
                <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '6px 8px', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  B. K. Birla College of Arts, Science &amp; Commerce (Empowered Autonomous Status), Kalyan.
                </div>
                <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '4px 8px', fontWeight: 'bold', fontSize: '13.5px' }}>
                  Bill for Assessment of Answer books
                </div>
                <div style={{ borderBottom: BORDER, textAlign: 'center', padding: '3px 8px', fontSize: '11px' }}>
                  UG / PG - Semester End Examinations (Winter Session / Summer Session)
                </div>

                <div style={{ display: 'flex', borderBottom: BORDER, fontSize: '11px' }}>
                  <div style={{ flex: 1, padding: '4px 8px', borderRight: BORDER, display: 'flex', alignItems: 'center' }}>
                    <strong>Semester :</strong>&nbsp;
                    {['I', 'II', 'III', 'IV', 'V', 'VI'].map((r, i) => (
                      <span key={r} style={{ fontWeight: (semester?.roman_label || bill?.semester?.roman_label) === r ? 'bold' : 'normal' }}>
                        {r}{i < 5 ? ' / ' : ''}
                      </span>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                    <strong>Month &amp; Year :</strong>&nbsp;{monthYear}
                  </div>
                </div>

                <div style={{ display: 'flex', borderBottom: BORDER, fontSize: '11px' }}>
                  <div style={{ flex: 1, padding: '4px 8px', borderRight: BORDER, display: 'flex', alignItems: 'center' }}>
                    <strong>Name of the Department :</strong>&nbsp;{department}
                  </div>
                  <div style={{ flex: 1, padding: '4px 8px', borderRight: BORDER, display: 'flex', alignItems: 'center' }}>
                    <strong>{isClassWise ? 'Name of the Class :' : 'Name of the Faculty :'}</strong>&nbsp;
                    {isClassWise ? (bill.class?.name || bill.class_name || '') : facultyName}
                  </div>
                  <div style={{ flex: 1, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                    <strong>Name of the HOD:</strong>&nbsp;{hodName}
                  </div>
                </div>
              </>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', tableLayout: 'fixed', backgroundColor: '#ffffff', color: '#000000' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: isClassWise ? '15%' : '9%' }} />
                <col style={{ width: isClassWise ? '20%' : '24%' }} />
                <col style={{ width: isClassWise ? '6%' : '7%' }} />
                <col style={{ width: isClassWise ? '5%' : '6%' }} />
                <col style={{ width: isClassWise ? '6%' : '7%' }} />
                <col style={{ width: isClassWise ? '11%' : '11%' }} />
                <col style={{ width: isClassWise ? '10%' : '9%' }} />
                <col style={{ width: isClassWise ? '11%' : '11%' }} />
                <col style={{ width: isClassWise ? '12%' : '11%' }} />
              </colgroup>

              <thead>
                <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  <th rowSpan={2} style={headerCell()}>Sr.<br />No.</th>
                  <th rowSpan={2} style={headerCell()}>{isClassWise ? 'Faculty Member' : 'Class'}</th>
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
                {Array.from({ length: page.totalRows }).map((_, idx) => {
                  const globalIdx = page.startIndex + idx;
                  const item = items[globalIdx];
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
                    <tr key={globalIdx} style={{ height: '20px' }}>
                      <td style={bodyCell()}>{globalIdx + 1}</td>
                      <td style={bodyCell({ padding: isClassWise ? '0 4px' : '0 3px', fontSize: isClassWise ? '9.5px' : '10px', textOverflow: 'ellipsis' })}>
                        {isDataRow ? (isClassWise ? (formatFacultyShortName(item.faculty_name) || '') : (item.class_name || bill.class?.name || 'SYCS')) : ''}
                      </td>
                      <td style={bodyCell({ textAlign: 'left', padding: '0 4px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
                        {isDataRow ? formatSubjectWithExamMode(item.subject?.name || item.subject_name, item.paper_type || 'THEORY', isClassWise ? 14 : 16) : ''}
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

                {page.isLastPage && (
                  <tr style={{ fontWeight: 'bold', height: '24px' }}>
                    <td colSpan={9} style={{ border: BORDER, textAlign: 'center', padding: '0 4px', lineHeight: '24px', height: '24px', letterSpacing: '0.1em', fontSize: '11px' }}>
                      TOTAL
                    </td>
                    <td style={{ border: BORDER, textAlign: 'center', padding: '0 4px', lineHeight: '24px', height: '24px', fontSize: '11px', fontWeight: 'bold' }}>
                      {grandTotal > 0 ? `${grandTotal}/-` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '10px', color: '#000000' }}>
            Page {page.pageNumber}{pages.length > 1 ? ` of ${pages.length}` : ''}
          </div>

          {page.isLastPage && (
            isClassWise ? (
              // Class-wise: only the Head / Principal signature
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginTop: '16px', border: BORDER, backgroundColor: '#ffffff', color: '#000000' }}>
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
                    <div style={{ fontSize: '9.5px' }}>Director / Principal (Autonomous)</div>
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
        </div>
      ))}
    </div>
  );
}
