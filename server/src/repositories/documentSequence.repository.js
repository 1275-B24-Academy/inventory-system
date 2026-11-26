const vietnamYear = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
});

export async function next(tx, docType) {
  const year = Number(vietnamYear.format(new Date()));

  // Dùng cùng transaction với thao tác lưu phiếu để số cấp được rollback nếu lưu lỗi.
  const [{ last_no: lastNo }] = await tx.$queryRaw`
    INSERT INTO document_sequences (doc_type, year, last_no)
    VALUES (${docType}, ${year}::integer, 1)
    ON CONFLICT (doc_type, year)
    DO UPDATE SET last_no = document_sequences.last_no + 1
    RETURNING last_no
  `;

  return `${docType}-${year}-${String(lastNo).padStart(5, "0")}`;
}
