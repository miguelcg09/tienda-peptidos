"use client";

import { useId, useState } from "react";

// Palabras cortas y fáciles de dictar por teléfono (sin tildes ni eñes).
const WORDS = (
  "agua alto amigo arbol arena barco blanco bosque brisa bueno cabra calle campo canto carta casa cerro cielo cobre " +
  "costa cuna dedo dulce encina faro feria fuego gato globo golfo hielo huerto isla jardin lago lana lima lino llave " +
  "lluvia luna mapa mar mesa miel monte nube nuez oasis ola oro oveja pan pato perla pino plata playa pluma puente " +
  "queso rio roca rosa sal selva sierra sol sur tarde tigre tierra tinta torre trigo uva valle vela verde viento volcan " +
  "zorro puma lupa nido paso rayo isla reloj sendero tomate canela almendra"
).split(" ");

function suggest() {
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  const words = Array.from(buf.slice(0, 4), (n) => WORDS[n % WORDS.length]);
  return `${words.join("-")}-${10 + (buf[4] % 90)}`;
}

// Campo de clave con "mostrar" y "sugerir una". Al sugerir se muestra en pantalla para poder dictársela a la persona.
export function PasswordField({
  name = "clave",
  label,
  suggestable = false,
  autoComplete = "new-password",
  minLength = 10,
}: {
  name?: string;
  label: string;
  suggestable?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="text-sm">
      <label htmlFor={id}>{label}</label>
      <div className="flex flex-wrap items-center gap-x-3">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          minLength={minLength}
          maxLength={200}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          className="field min-w-0 flex-[1_1_100%] sm:flex-[1_1_0%]"
        />
        <button type="button" onClick={() => setShown((v) => !v)} aria-pressed={shown} className="inline-flex min-h-10 items-center text-accent-2 hover:underline">
          {shown ? "Ocultar" : "Mostrar"}
        </button>
        {suggestable && (
          <button
            type="button"
            onClick={() => {
              setValue(suggest());
              setShown(true);
            }}
            className="inline-flex min-h-10 items-center text-accent-2 hover:underline"
          >
            Sugerir una
          </button>
        )}
      </div>
    </div>
  );
}
