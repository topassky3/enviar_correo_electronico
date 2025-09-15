import React, { useState } from "react";
import "./contact-form.css";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return setStatus({ loading: false, ok: false, msg: "Completa todos los campos." });
    }
    if (!isEmail(form.email)) {
      return setStatus({ loading: false, ok: false, msg: "Correo inválido." });
    }

    try {
      setStatus({ loading: true, ok: null, msg: "" });
      const res = await fetch("http://localhost:8000/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Error al enviar.");
      setStatus({ loading: false, ok: true, msg: "¡Mensaje enviado! Te responderemos pronto." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: err.message || "Error de red." });
    }
  };

  return (
    <div className="cf-card">
      <h2 className="cf-title">Contáctanos</h2>
      <form className="cf-form" onSubmit={onSubmit} noValidate>
        <label className="cf-label">Nombre</label>
        <input
          className="cf-input"
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Tu nombre"
          required
        />

        <label className="cf-label">Correo</label>
        <input
          className="cf-input"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="tucorreo@ejemplo.com"
          required
        />

        <label className="cf-label">Mensaje</label>
        <textarea
          className="cf-textarea"
          name="message"
          value={form.message}
          onChange={onChange}
          placeholder="¿En qué podemos ayudarte?"
          rows={5}
          required
        />

        <button className="cf-button" disabled={status.loading}>
          {status.loading ? "Enviando..." : "Enviar"}
        </button>

        {status.msg && (
          <p className={`cf-alert ${status.ok ? "cf-ok" : "cf-error"}`}>{status.msg}</p>
        )}
      </form>
    </div>
  );
}
