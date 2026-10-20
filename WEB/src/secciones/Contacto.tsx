import { useState, type FormEvent } from "react";
import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";
import { AGENDA, CORREO, FORMULARIO, FORMULARIO_LISTO, TELEFONO, TELEFONO_ENLACE, WHATSAPP } from "../datos/contacto";

export function Contacto() {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Mientras el formulario no tenga destino, no se finge un envío.
    if (!FORMULARIO_LISTO) {
      setError(`El formulario todavía no está activo. Escríbenos a ${CORREO} o por WhatsApp y te respondemos.`);
      return;
    }
    setEnviando(true);
    try {
      const formulario = e.currentTarget;
      const res = await fetch(FORMULARIO, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(formulario) });
      if (!res.ok) throw new Error();
      setEnviado(true);
      formulario.reset();
    } catch {
      setError("No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos por correo o WhatsApp.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="contact" className="section--decorated" data-section-num="06">
      <EncabezadoSeccion indice="06 / Contacto">
        <span>
          Cuéntanos tu <em>proyecto</em>.
        </span>
      </EncabezadoSeccion>

      <div className="contact">
        <div className="contact__grid reveal">
          <div>
            <div className="k eyebrow">Email</div>
            <div className="v">
              <a href={`mailto:${CORREO}`}>
                {CORREO.split("@")[0]}
                <br />@{CORREO.split("@")[1]}
              </a>
            </div>
          </div>
          <div>
            <div className="k eyebrow">Teléfono</div>
            <div className="v">
              <a href={TELEFONO_ENLACE}>{TELEFONO}</a>
            </div>
          </div>
          <div>
            <div className="k eyebrow">WhatsApp</div>
            <div className="v">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                Abrir chat ↗
              </a>
            </div>
          </div>
          <div>
            <div className="k eyebrow">Agenda</div>
            <div className="v">
              <a href={AGENDA} target="_blank" rel="noopener noreferrer">
                Reservar cita ↗
              </a>
            </div>
          </div>
          <div>
            <div className="k eyebrow">Estudio</div>
            <div className="v">Lima, Perú</div>
          </div>
          <div>
            <div className="k eyebrow">Horario</div>
            <div className="v">
              Lun — Vie
              <br />
              09:00 — 18:00
            </div>
          </div>
        </div>

        <form className="contact__form reveal" onSubmit={enviar}>
          <div className="side">
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Formulario
            </div>
            <p className="body-copy" style={{ fontSize: 13 }}>
              Cuéntanos un poco sobre el espacio, el alcance y los tiempos ideales. Te respondemos dentro de 48 horas hábiles.
            </p>
          </div>
          <div>
            {enviado ? (
              <div style={{ padding: "40px 0" }} role="status">
                <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 14 }}>
                  Mensaje enviado
                </div>
                <div style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 1.1 }}>
                  Gracias. Te <em style={{ fontStyle: "italic", color: "var(--accent-soft)" }}>escribimos</em> pronto.
                </div>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label className="mono" htmlFor="f-nombre">
                      Nombre
                    </label>
                    <input id="f-nombre" name="nombre" type="text" required placeholder="Tu nombre" />
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-email">
                      Email
                    </label>
                    <input id="f-email" name="email" type="email" required placeholder="tucorreo@ejemplo.com" />
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-tipo">
                      Tipo de proyecto
                    </label>
                    <select id="f-tipo" name="tipo" defaultValue="Residencial">
                      <option>Residencial</option>
                      <option>Oficinas</option>
                      <option>Comercial / Retail</option>
                      <option>Hotelería</option>
                      <option>Styling</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-area">
                      Área aprox.
                    </label>
                    <input id="f-area" name="area" type="text" placeholder="m²" />
                  </div>
                  <div className="field full">
                    <label className="mono" htmlFor="f-mensaje">
                      Cuéntanos
                    </label>
                    <textarea id="f-mensaje" name="mensaje" rows={4} placeholder="Sobre el proyecto, plazos, presupuesto..." />
                  </div>
                </div>
                {error && (
                  <div className="form-error" role="alert">
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 16 }}>
                  <button className="submit-btn" type="submit" disabled={enviando}>
                    {enviando ? "Enviando…" : "Enviar mensaje"} <span>↗</span>
                  </button>
                  <a className="submit-btn submit-btn--ghost" href={AGENDA} target="_blank" rel="noopener noreferrer">
                    Agendar cita <span>↗</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
