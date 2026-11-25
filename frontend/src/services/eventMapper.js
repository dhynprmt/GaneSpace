/**
 * Adapts the nested Laravel EventResource contract to the legacy view-model
 * consumed by the existing GaneSpace pages. Private meeting URLs are never
 * synthesized or read here; EventResource intentionally omits them.
 */
export function normalizeEventResource(event = {}, context = "public") {
  const category = event.category || {};
  const eventType = event.event_type || {};
  const organization = event.organization || {};
  const schedule = event.schedule || {};
  const location = event.location || {};
  const registration = event.registration || {};
  const contact = event.contact || {};
  const poster = event.poster || null;

  const isAcademic = category.slug === "academic";
  const publicationStatus = event.publication_status || "draft";
  const registrationStatus = registration.status || "closed";
  const cancelled = Boolean(event.cancelled || event.cancellation);
  const startsAt = schedule.start_at || null;
  const endsAt = schedule.end_at || null;
  const venueName = location.venue_name || "";
  const venueAddress = location.venue_address || "";

  return {
    ...event,
    domain: isAcademic ? "academic" : "non_academic",
    category: eventType.name || category.name || "",
    category_slug: eventType.slug || "",
    event_type: eventType.name || "",
    event_type_id: eventType.id ?? null,
    organizer: organization.name || "",
    organization_id: organization.id ?? null,
    organization,
    start_datetime: startsAt,
    end_datetime: endsAt,
    location: venueAddress || venueName,
    room: venueAddress && venueName ? venueName : "",
    location_mode: location.mode || "onsite",
    venue_name: venueName,
    venue_address: venueAddress,
    capacity: registration.capacity ?? null,
    active_registrations: registration.active_count ?? 0,
    registration_opens_at: registration.opens_at || null,
    registration_closes_at: registration.closes_at || null,
    registration_period: [registration.opens_at, registration.closes_at]
      .filter(Boolean)
      .join(" – "),
    external_registration_url: registration.external_url || "",
    contact_person: [contact.name, contact.email, contact.phone]
      .filter(Boolean)
      .join(" · "),
    contact_name: contact.name || "",
    contact_email: contact.email || "",
    contact_phone: contact.phone || "",
    requirements: event.participant_requirements?.split(/\r?\n/).filter(Boolean) || [],
    poster_url: poster?.url || "",
    poster_id: poster?.id ?? null,
    poster_alt_text: poster?.alt_text || "",
    is_sempro: eventType.slug === "proposal-seminar",
    publication_status: publicationStatus,
    registration_status: registrationStatus,
    is_published: publicationStatus === "published",
    cancelled,
    cancellation_reason: event.cancellation?.reason || "",
    status: context === "admin"
      ? (cancelled ? "cancelled" : publicationStatus)
      : (cancelled ? "cancelled" : registrationStatus),
    active_registrations_count: registration.active_count ?? 0,
    is_featured: Boolean(event.is_featured),
  };
}

export function normalizeOrganizationResource(organization = {}) {
  return {
    ...organization,
    type: organization.organization_type || "",
    organization_type: organization.organization_type || "",
    faculty_id: organization.faculty?.id ?? organization.faculty_id ?? null,
    faculty: organization.faculty?.name || "",
    parent_name: organization.parent?.name || "",
    status: organization.is_active ? "active" : "inactive",
  };
}

export function unwrapEventCollection(responseData, context = "public") {
  const rows = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
      ? responseData
      : [];

  return rows.map((event) => normalizeEventResource(event, context));
}
