import { useState } from "react";
const API_BASE = "http://localhost:3000/api/getaways";

function getAuthToken() {
  return localStorage.getItem("token") || "";
}

function clampArray(arr, max) {
  return arr.slice(0, max);
}

export default function CreateGetaway() {
  const [form, setForm] = useState({
    getawayTitle: "",
    getawayOverview: "",
    startDate: "",
    endDate: "",
    sport: "Tennis",
    price: "",
    address: "",
    videoLinks: [""],
  });

  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [galleryPreviews, setGalleryPreviews] = useState([]); 

 
  const [details, setDetails] = useState({
    mainDescription: "",
    amenities: [""],
    schedule: [createEmptyScheduleItem()],
    lodgingOptions: [{ name: "", price: "" }],
    optionalAddOns: [{ name: "", price: "" }],
    academyOptions: [createEmptyAcademyItem(true)],
    tournamentsOptions: [createEmptyTournamentItem()],
    LaddersOptions: [createEmptyTournamentItem()],
    policies: [""],
    terms: [""],
  });

  function createEmptyScheduleItem() {
    return {
      weekday: "Monday",
      startTime: "",
      endTime: "",
      location: "",
      Activity: "",
    };
  }

  function createEmptyAcademyItem(isIncluded = false) {
    return {
      weekday: "Saturday",
      startTime: "",
      endTime: "",
      location: "",
      court: "",
      trainer: [""],
      isIncluded: isIncluded,
      price: "",
    };
  }

  function createEmptyTournamentItem() {
    return {
      tournamentName: "",
      Location: "",
      startDate: "",
      endDate: "",
      rankingType: "",
      mode: "",
      isIncluded: false,
      price: "",
    };
  }

  function updateForm(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function updateDetails(key, value) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  // File handling
  function onGalleryChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length + galleryFiles.length > 5) {
      alert("You can upload up to 5 images total.");
      return;
    }
    const newFiles = clampArray(files, 5 - galleryFiles.length);
    setGalleryFiles((prev) => [...prev, ...newFiles]);

    // previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPreviews((p) => [...p, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // reset input
    e.target.value = null;
  }

  function removeGalleryImage(index) {
    setGalleryFiles((f) => f.filter((_, i) => i !== index));
    setGalleryPreviews((p) => p.filter((_, i) => i !== index));
  }

  // Dynamic array helpers
  function addArrayItem(key, template) {
    setDetails((d) => ({ ...d, [key]: [...(d[key] || []), template] }));
  }

  function removeArrayItem(key, idx) {
    setDetails((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));
  }

  function updateArrayItem(key, idx, newItem) {
    setDetails((d) => ({
      ...d,
      [key]: d[key].map((it, i) => (i === idx ? newItem : it)),
    }));
  }

  function handleAmenityChange(idx, value) {
    const arr = [...details.amenities];
    arr[idx] = value;
    updateDetails("amenities", arr);
  }

  function handleVideoLinkChange(idx, value) {
    const arr = [...form.videoLinks];
    arr[idx] = value;
    setForm((s) => ({ ...s, videoLinks: arr }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!form.getawayTitle) return alert("Debe ingresar un título");
    if (!form.startDate || !form.endDate) return alert("Fechas requeridas");
    if (galleryFiles.length === 0)
      if (!confirm("No subiste imágenes. Continuar?")) return;

    const getawayDetailsPayload = {
      ...details,
      // ensure limits
      amenities: clampArray(details.amenities.filter(Boolean), 5),
      schedule: clampArray(details.schedule, 50),
      lodgingOptions: clampArray(
        details.lodgingOptions.filter((i) => i.name),
        3
      ),
      optionalAddOns: clampArray(
        details.optionalAddOns.filter((i) => i.name),
        5
      ),
      academyOptions: clampArray(details.academyOptions, 10),
      tournamentsOptions: clampArray(details.tournamentsOptions, 10),
      LaddersOptions: clampArray(details.LaddersOptions, 10),
      policies: clampArray(details.policies.filter(Boolean), 5),
      terms: clampArray(details.terms.filter(Boolean), 5),
    };

    const payload = {
      getawayTitle: form.getawayTitle,
      getawayOverview: form.getawayOverview,
      startDate: form.startDate,
      endDate: form.endDate,
      sport: form.sport,
      price: Number(form.price || 0),
      address: form.address,
      videoLink: clampArray(form.videoLinks.filter(Boolean), 3),
      getawayDetails: getawayDetailsPayload,
    };

    const fd = new FormData();
    // append fields (strings/or JSON)
    Object.entries(payload).forEach(([k, v]) => {
      if (typeof v === "object") {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, String(v ?? ""));
      }
    });

    // append files under the field name expected by multer
    galleryFiles.forEach((file) => {
      fd.append("galleryPhoto", file, file.name);
    });

    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          // DO NOT set Content-Type; browser will set multipart/form-data with boundary
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error creating offer");

      alert("Oferta creada! ID: " + data.id);
      // reset form or redirect
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Crear Getaway</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              value={form.getawayTitle}
              onChange={(e) => updateForm("getawayTitle", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deporte</label>
            <select
              value={form.sport}
              onChange={(e) => updateForm("sport", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            >
              <option>Tennis</option>
              <option>Padel</option>
              <option>Pickelball</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">
              Descripción breve
            </label>
            <textarea
              value={form.getawayOverview}
              onChange={(e) => updateForm("getawayOverview", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fecha inicio</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateForm("startDate", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha fin</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateForm("endDate", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Precio (COP)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              value={form.address}
              onChange={(e) => updateForm("address", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>
        </section>

        {/* Gallery */}
        <section className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Galería (hasta 5 imágenes)</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onGalleryChange}
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {galleryPreviews.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`preview-${i}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Video links */}
        <section className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Videos (hasta 3)</h2>
          {form.videoLinks.map((v, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <input
                value={v}
                onChange={(e) => handleVideoLinkChange(i, e.target.value)}
                placeholder={`Video ${i + 1} (youtube/vimeo link)`}
                className="flex-1 p-2 border rounded"
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      videoLinks: s.videoLinks.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="p-2"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          {form.videoLinks.length < 3 && (
            <button
              type="button"
              onClick={() =>
                setForm((s) => ({ ...s, videoLinks: [...s.videoLinks, ""] }))
              }
              className="mt-2 p-2 rounded border"
            >
              Agregar video
            </button>
          )}
        </section>

        {/* getawayDetails */}
        <section className="border p-4 rounded space-y-4">
          <h2 className="font-semibold">Detalles</h2>
          <div>
            <label className="block text-sm font-medium">
              Descripción principal
            </label>
            <textarea
              value={details.mainDescription}
              onChange={(e) => updateDetails("mainDescription", e.target.value)}
              className="mt-1 block w-full rounded p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Amenidades (hasta 5)
            </label>
            {details.amenities.map((a, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={a}
                  onChange={(e) => handleAmenityChange(i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                {details.amenities.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDetails(
                        "amenities",
                        details.amenities.filter((_, idx) => idx !== i)
                      )
                    }
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {details.amenities.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  updateDetails("amenities", [...details.amenities, ""])
                }
                className="p-2 rounded border"
              >
                Agregar amenidad
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Horario (schedule)
            </label>
            {details.schedule.map((s, i) => (
              <div key={i} className="p-2 border rounded mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={s.weekday}
                    onChange={(e) =>
                      updateArrayItem("schedule", i, {
                        ...s,
                        weekday: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                  </select>
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) =>
                      updateArrayItem("schedule", i, {
                        ...s,
                        startTime: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) =>
                      updateArrayItem("schedule", i, {
                        ...s,
                        endTime: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  />
                  <input
                    value={s.location}
                    onChange={(e) =>
                      updateArrayItem("schedule", i, {
                        ...s,
                        location: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                    placeholder="Ubicación"
                  />
                </div>
                <input
                  value={s.Activity}
                  onChange={(e) =>
                    updateArrayItem("schedule", i, {
                      ...s,
                      Activity: e.target.value,
                    })
                  }
                  className="mt-2 p-2 border rounded"
                  placeholder="Actividad"
                />
                <div className="flex gap-2 mt-2">
                  {details.schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("schedule", i)}
                      className="p-2 border rounded"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      updateArrayItem("schedule", i, {
                        ...s,
                        Activity: s.Activity,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("schedule", createEmptyScheduleItem())
                }
                className="p-2 rounded border"
              >
                Agregar horario
              </button>
            </div>
          </div>

          {/* Lodging options */}
          <div>
            <label className="block text-sm font-medium">
              Opciones de alojamiento (hasta 3)
            </label>
            {details.lodgingOptions.map((l, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={l.name}
                  onChange={(e) =>
                    updateArrayItem("lodgingOptions", i, {
                      ...l,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nombre"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  value={l.price}
                  onChange={(e) =>
                    updateArrayItem("lodgingOptions", i, {
                      ...l,
                      price: e.target.value,
                    })
                  }
                  placeholder="Precio"
                  className="w-28 p-2 border rounded"
                />
                {details.lodgingOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("lodgingOptions", i)}
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {details.lodgingOptions.length < 3 && (
              <button
                type="button"
                onClick={() =>
                  addArrayItem("lodgingOptions", { name: "", price: "" })
                }
                className="p-2 rounded border"
              >
                Agregar alojamiento
              </button>
            )}
          </div>

          {/* optionalAddOns */}
          <div>
            <label className="block text-sm font-medium">
              Add-Ons opcionales (hasta 5)
            </label>
            {details.optionalAddOns.map((o, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={o.name}
                  onChange={(e) =>
                    updateArrayItem("optionalAddOns", i, {
                      ...o,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nombre"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  value={o.price}
                  onChange={(e) =>
                    updateArrayItem("optionalAddOns", i, {
                      ...o,
                      price: e.target.value,
                    })
                  }
                  placeholder="Precio"
                  className="w-28 p-2 border rounded"
                />
                {details.optionalAddOns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("optionalAddOns", i)}
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {details.optionalAddOns.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  addArrayItem("optionalAddOns", { name: "", price: "" })
                }
                className="p-2 rounded border"
              >
                Agregar add-on
              </button>
            )}
          </div>

          {/* Academy Options */}
          <div>
            <label className="block text-sm font-medium">Academy Options</label>
            {details.academyOptions.map((a, i) => (
              <div key={i} className="p-2 border rounded mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={a.weekday}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        weekday: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option>Saturday</option>
                    <option>Sunday</option>
                    <option>Monday</option>
                  </select>
                  <input
                    type="time"
                    value={a.startTime}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        startTime: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="time"
                    value={a.endTime}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        endTime: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  />
                  <input
                    value={a.location}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        location: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                    placeholder="Ubicación"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    value={a.court}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        court: e.target.value,
                      })
                    }
                    placeholder="Cancha"
                    className="p-2 border rounded"
                  />
                  <input
                    value={a.price}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        price: e.target.value,
                      })
                    }
                    placeholder="Precio por persona"
                    className="p-2 border rounded"
                  />
                </div>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={a.isIncluded}
                      onChange={(e) =>
                        updateArrayItem("academyOptions", i, {
                          ...a,
                          isIncluded: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Incluida en paquete
                  </label>
                </div>

                <div className="mt-2">
                  <label className="block text-sm">
                    Trainers (coma separado)
                  </label>
                  <input
                    value={(a.trainer || []).join(",")}
                    onChange={(e) =>
                      updateArrayItem("academyOptions", i, {
                        ...a,
                        trainer: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1 p-2 border rounded w-full"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  {details.academyOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("academyOptions", i)}
                      className="p-2 border rounded"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                addArrayItem("academyOptions", createEmptyAcademyItem(false))
              }
              className="p-2 rounded border"
            >
              Agregar academy option
            </button>
          </div>

          {/* tournaments & ladders */}
          <div>
            <label className="block text-sm font-medium">
              Tournaments Options
            </label>
            {details.tournamentsOptions.map((t, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={t.tournamentName}
                  onChange={(e) =>
                    updateArrayItem("tournamentsOptions", i, {
                      ...t,
                      tournamentName: e.target.value,
                    })
                  }
                  placeholder="Nombre torneo"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  value={t.Location}
                  onChange={(e) =>
                    updateArrayItem("tournamentsOptions", i, {
                      ...t,
                      Location: e.target.value,
                    })
                  }
                  placeholder="Ubicación"
                  className="w-36 p-2 border rounded"
                />
                <input
                  type="date"
                  value={t.startDate}
                  onChange={(e) =>
                    updateArrayItem("tournamentsOptions", i, {
                      ...t,
                      startDate: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  value={t.endDate}
                  onChange={(e) =>
                    updateArrayItem("tournamentsOptions", i, {
                      ...t,
                      endDate: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                {details.tournamentsOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("tournamentsOptions", i)}
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                addArrayItem("tournamentsOptions", createEmptyTournamentItem())
              }
              className="p-2 rounded border"
            >
              Agregar torneo
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium">Ladders Options</label>
            {details.LaddersOptions.map((t, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={t.tournamentName}
                  onChange={(e) =>
                    updateArrayItem("LaddersOptions", i, {
                      ...t,
                      tournamentName: e.target.value,
                    })
                  }
                  placeholder="Nombre"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  value={t.Location}
                  onChange={(e) =>
                    updateArrayItem("LaddersOptions", i, {
                      ...t,
                      Location: e.target.value,
                    })
                  }
                  placeholder="Ubicación"
                  className="w-36 p-2 border rounded"
                />
                <input
                  type="date"
                  value={t.startDate}
                  onChange={(e) =>
                    updateArrayItem("LaddersOptions", i, {
                      ...t,
                      startDate: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  value={t.endDate}
                  onChange={(e) =>
                    updateArrayItem("LaddersOptions", i, {
                      ...t,
                      endDate: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                {details.LaddersOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem("LaddersOptions", i)}
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                addArrayItem("LaddersOptions", createEmptyTournamentItem())
              }
              className="p-2 rounded border"
            >
              Agregar ladder
            </button>
          </div>

          {/* policies & terms */}
          <div>
            <label className="block text-sm font-medium">
              Policies (hasta 5)
            </label>
            {details.policies.map((p, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={p}
                  onChange={(e) =>
                    updateDetails(
                      "policies",
                      details.policies.map((x, idx) =>
                        idx === i ? e.target.value : x
                      )
                    )
                  }
                  className="flex-1 p-2 border rounded"
                />
                {details.policies.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDetails(
                        "policies",
                        details.policies.filter((_, idx) => idx !== i)
                      )
                    }
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {details.policies.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  updateDetails("policies", [...details.policies, ""])
                }
                className="p-2 rounded border"
              >
                Agregar policy
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Terms (hasta 5)</label>
            {details.terms.map((t, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  value={t}
                  onChange={(e) =>
                    updateDetails(
                      "terms",
                      details.terms.map((x, idx) =>
                        idx === i ? e.target.value : x
                      )
                    )
                  }
                  className="flex-1 p-2 border rounded"
                />
                {details.terms.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDetails(
                        "terms",
                        details.terms.filter((_, idx) => idx !== i)
                      )
                    }
                    className="p-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {details.terms.length < 5 && (
              <button
                type="button"
                onClick={() => updateDetails("terms", [...details.terms, ""])}
                className="p-2 rounded border"
              >
                Agregar term
              </button>
            )}
          </div>
        </section>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Limpiar formulario?")) {
                setForm({
                  getawayTitle: "",
                  getawayOverview: "",
                  startDate: "",
                  endDate: "",
                  sport: "Tennis",
                  price: "",
                  address: "",
                  videoLinks: [""],
                });
                setDetails({
                  mainDescription: "",
                  amenities: [""],
                  schedule: [createEmptyScheduleItem()],
                  lodgingOptions: [{ name: "", price: "" }],
                  optionalAddOns: [{ name: "", price: "" }],
                  academyOptions: [createEmptyAcademyItem(true)],
                  tournamentsOptions: [createEmptyTournamentItem()],
                  LaddersOptions: [createEmptyTournamentItem()],
                  policies: [""],
                  terms: [""],
                });
                setGalleryFiles([]);
                setGalleryPreviews([]);
              }
            }}
            className="px-4 py-2 border rounded"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
