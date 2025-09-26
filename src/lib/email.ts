export type LeaveStatus = "approved" | "rejected";

export function leaveStatusEmailHTML(opts: {
  employeeName: string;
  status: LeaveStatus;
  leaveType: string;
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
  appUrl?: string;
}) {
  const { employeeName, status, leaveType, startDate, endDate, rejectionReason, appUrl } = opts;
  const nice =
    status === "approved"
      ? { title: "✅ Solicitud de licencia APROBADA", color: "#16a34a" }
      : { title: "❌ Solicitud de licencia RECHAZADA", color: "#dc2626" };

  return /* html */ `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111827">
    <h2 style="margin:0 0 8px 0;color:${nice.color}">${nice.title}</h2>
    <p>Hola <b>${employeeName}</b>,</p>
    <p>Tu solicitud de licencia de tipo <b>${leaveType}</b> ha sido <b>${status === "approved" ? "aprobada" : "rechazada"}</b>.</p>
    ${startDate ? `<p><b>Desde:</b> ${new Date(startDate).toLocaleDateString()}</p>` : ""}
    ${endDate ? `<p><b>Hasta:</b> ${new Date(endDate).toLocaleDateString()}</p>` : ""}
    ${
      status === "rejected" && rejectionReason
        ? `<p><b>Motivo del rechazo:</b> ${rejectionReason}</p>`
        : ""
    }
    ${
      appUrl
        ? `<p>Puedes ver el detalle ingresando a <a href="${appUrl}/employee/leaves">${appUrl}/employee/leaves</a>.</p>`
        : ""
    }
    <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb" />
    <p style="font-size:12px;color:#6b7280">Este es un mensaje automático de CyberHR.</p>
  </div>
  `;
}
