import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";
import { COMUNICACIONES, DIRECCION, type Integrante } from "../datos/estudio";

const dos = (n: number) => String(n).padStart(2, "0");

function Foto({ m, clase }: { m: Integrante; clase: string }) {
  return (
    <div className={clase} aria-hidden={m.foto ? "false" : "true"}>
      {m.foto ? (
        <img src={`${import.meta.env.BASE_URL}img/equipo/${m.foto}.webp`} alt={`${m.nombre} ${m.apellido} — ${m.rol}`} loading="lazy" />
      ) : (
        <div className="team-photo__placeholder">
          <span className="mono">Foto pronto</span>
        </div>
      )}
    </div>
  );
}

function Director({ m }: { m: Integrante }) {
  return (
    <div className="team-lead reveal">
      <Foto m={m} clase="team-lead__photo" />
      <div className="team-lead__body">
        <div className="mono num">
          {m.num} / {dos(DIRECCION.length)}
        </div>
        <div className="name">
          {m.nombre}
          <br />
          <em>{m.apellido}</em>
        </div>
        <div className="role mono">{m.rol}</div>
        <div className="bio">{m.bio}</div>
      </div>
    </div>
  );
}

function Miembro({ m }: { m: Integrante }) {
  return (
    <div className="team-member reveal">
      <Foto m={m} clase="team-member__photo" />
      <div className="team-member__body">
        <div className="mono num">
          {m.num} / {dos(COMUNICACIONES.length)}
        </div>
        <div className="name">
          {m.nombre} <em>{m.apellido}</em>
        </div>
        <div className="role mono">{m.rol}</div>
        <div className="bio">{m.bio}</div>
      </div>
    </div>
  );
}

export function Equipo() {
  return (
    <section id="team" className="section--decorated" data-section-num="04">
      <EncabezadoSeccion indice="04 / Equipo">
        <span>
          Quiénes <em>somos</em>.
        </span>
      </EncabezadoSeccion>

      <div className="team">
        <div className="side">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Estudio
          </div>
          <p className="body-copy" style={{ fontSize: 13 }}>
            Somos un equipo multidisciplinario. Detrás de cada proyecto hay diseño, dirección creativa, comunicación y registro fotográfico — todo coordinado desde un mismo estudio.
          </p>
        </div>

        <div className="team-main">
          <div className="team-tier team-tier--lead">
            <div className="team-tier__head">
              <span className="eyebrow" style={{ color: "var(--accent-soft)" }}>
                // Dirección
              </span>
              <span className="mono" style={{ color: "var(--muted)", marginLeft: 14 }}>
                {dos(DIRECCION.length)} arquitectos
              </span>
            </div>
            <div className="team-lead-grid">
              {DIRECCION.map((m) => (
                <Director key={m.num} m={m} />
              ))}
            </div>
          </div>

          <div className="team-tier team-tier--support">
            <div className="team-tier__head">
              <span className="eyebrow" style={{ color: "var(--accent-ochre)" }}>
                // Comunicaciones
              </span>
              <span className="mono" style={{ color: "var(--muted)", marginLeft: 14 }}>
                {dos(COMUNICACIONES.length)} miembros
              </span>
            </div>
            <div className="team-member-grid">
              {COMUNICACIONES.map((m) => (
                <Miembro key={m.num} m={m} />
              ))}
            </div>
          </div>
        </div>

        <div className="team-group reveal">
          <div className="team-group__placeholder">
            <div className="eyebrow">Foto grupal</div>
            <div className="team-group__title">La foto del equipo completo está en proceso — pronto estará aquí.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
