const STORAGE_KEY = "crh-condos-state-v1";

const defaultState = {
  session: {
    role: null,
    userId: null,
    page: "welcome",
  },
  ui: {
    authRole: "tenant",
    language: "es",
    loginError: "",
    flash: "",
    modal: null,
    paymentLeaseFilter: null,
  },
  data: seedData(),
};

let state = loadState();

const I18N = {
  en: {
    welcome_brand: "CRH Condos • Coastal Rise Holdings LLC",
    welcome_title: "Rental management with a sharper, calmer feel.",
    welcome_copy: "A modern portal for tenants and property managers to handle leases, maintenance tickets, and payments from one clean workspace.",
    lease_first: "Lease-first",
    lease_first_copy: "Tenant, property, and terms connected in a single record.",
    stripe_ready: "Stripe-ready",
    stripe_ready_copy: "Payments can transition from demo mode to Checkout Sessions.",
    ticket_flow: "Ticket flow",
    ticket_flow_copy: "Residents report issues fast while managers keep status visible.",
    welcome_to: "Welcome to CRH Condos",
    choose_portal: "Choose your portal",
    choose_portal_copy: "Select a login path, then enter your email and password to continue.",
    tenant_login: "Tenant Login",
    tenant_login_copy: "Profile, lease, payments, tickets",
    manager_login: "Property Manager Login",
    manager_login_copy: "Leases, reports, payments, tickets",
    email: "Email",
    password: "Password",
    enter_password: "Enter your password",
    enter_portal: "Enter portal",
    demo_accounts: "Demo accounts",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    welcome: "Welcome",
    property_operations: "Property Operations",
    lease_management: "Lease Management",
    tenant_tickets: "Tenant Tickets",
    lease_payment_history: "Lease Payment History",
    tenant_profile: "Tenant Profile",
    my_lease: "My Lease",
    payments: "Payments",
    my_tickets: "My Tickets",
    app_subtitle: "A polished rental experience for Coastal Rise Holdings LLC.",
    admin_subtitle: "Manage leases, monitor payments, and keep resident operations moving in one place.",
    tenant_subtitle: "Stay on top of your lease, maintenance requests, and payments with a simple tenant portal.",
    manager_console: "Manager Console",
    tenant_portal: "Tenant Portal",
    log_out: "Log out",
    create_lease: "Create Lease",
    create_ticket_plus: "Create New Ticket+",
    home: "Home",
    leases: "Leases",
    tickets: "Tickets",
    active_leases: "Active leases",
    active_leases_copy: "Currently occupied and in motion.",
    inactive_leases: "Inactive leases",
    inactive_leases_copy: "Ready for renewal, turnover, or archive decisions.",
    payments_received: "Payments received",
    payments_received_copy: "All recorded payments across your units.",
    open_tickets: "Open tickets",
    open_tickets_copy: "Maintenance items waiting on action.",
    lease_battery_view: "Lease battery view",
    lease_battery_copy: "A quick visual read of how much time remains before each lease ends.",
    portfolio_pulse: "Portfolio pulse",
    portfolio_pulse_copy: "Condensed counts to keep the week clear and manageable.",
    total_leases: "Total leases",
    total_leases_copy: "Across all managed apartments",
    tickets_closed: "Tickets closed",
    tickets_closed_copy: "Resolved maintenance requests",
    average_monthly_rent: "Average monthly rent",
    average_monthly_rent_copy: "Current lease book average",
    days_left: "{days} days left",
    ended: "Ended",
    new_lease: "New lease",
    leases_copy: "Create, review, edit, or remove any lease from a single table.",
    tenant: "Tenant",
    property: "Property",
    status: "Status",
    term: "Term",
    monthly_cost: "Monthly Cost",
    parking: "Parking",
    actions: "Actions",
    payment_history: "Payment History",
    edit: "Edit",
    delete: "Delete",
    all_recorded_payments: "All recorded payments across leases{suffix}.",
    selected_lease_suffix: " for {name}",
    show_all_payments: "Show all payments",
    date: "Date",
    lease: "Lease",
    description: "Description",
    method: "Method",
    amount: "Amount",
    no_payments_for_lease: "No payments have been recorded yet for this lease.",
    tickets_copy: "Track maintenance requests and close the loop with tenants clearly.",
    created: "Created",
    nature: "Nature",
    preview: "Preview",
    open: "Open",
    close_ticket: "Close ticket",
    reopen: "Reopen",
    no_tickets: "No tickets have been created yet.",
    primary_tenant: "Primary tenant",
    tenant_profile_copy: "You can update your email, phone, and password here.",
    first_name: "First name",
    last_name: "Last name",
    phone: "Phone",
    save_profile: "Save profile",
    derivative_occupants: "Derivative occupants",
    derivative_occupants_copy: "Visible here as part of your lease record. Editing remains manager-only.",
    derivative_occupant: "Derivative occupant",
    no_derivatives: "No derivative occupants are attached to this lease.",
    lease_overview: "Lease overview",
    lease_overview_copy: "This section is read-only and matches the management side.",
    start_date: "Start date",
    end_date: "End date",
    deposit_made: "Deposit made",
    parking_spaces: "Parking spaces",
    property_details: "Property details",
    property_details_copy: "Your current residence and listed occupants.",
    address: "Address",
    principal_tenant: "Principal tenant",
    other_payments_recorded: "Other payments recorded at lease setup",
    no_derivatives_listed: "No derivatives listed",
    none_recorded: "None recorded",
    no_lease_attached: "No lease is currently attached to your account.",
    make_payment: "Make a Payment",
    make_payment_copy: "Use the Stripe-ready payment button to post your next payment.",
    suggested_amount: "Suggested amount",
    payment_demo_copy: "In demo mode this records a payment instantly. For production, connect Stripe Checkout Sessions to the configured backend endpoint.",
    stripe_setup_status: "Stripe setup status",
    stripe_setup_copy: "Current payment configuration for this prototype.",
    mode: "Mode",
    checkout_endpoint: "Checkout endpoint",
    publishable_key: "Publishable key",
    not_configured: "Not configured yet",
    payment_history_copy_tenant: "Every payment posted on your lease is listed here.",
    no_payments_tenant: "No payments are recorded for your lease yet.",
    my_tickets_copy: "Review the issues you have reported and their current status.",
    describe_problem: "Describe the problem",
    no_tenant_tickets: "You have not created any maintenance tickets yet.",
    edit_lease: "Edit Lease",
    create_lease_title: "Create Lease",
    lease_form_copy: "Principal tenant credentials create or update the tenant-role user automatically.",
    close: "Close",
    tenants_information: "Tenants information",
    derivatives: "Derivatives",
    derivatives_copy: "Add additional listed occupants when needed.",
    add_derivatives: "Add+ Derivatives",
    remove: "Remove",
    property_information: "Property information",
    street_address: "Street address",
    unit_apartment: "Unit / Apartment",
    city: "City",
    state: "State",
    zip: "Zip",
    lease_terms: "Lease terms",
    active: "Active",
    inactive: "Inactive",
    open_status: "open",
    closed_status: "closed",
    other_payments_made: "Other payments made",
    other_payments_copy: "Add any additional charges or credits recorded during lease setup.",
    add_payment: "Add payment",
    save_changes: "Save changes",
    create_lease_button: "Create lease",
    cancel: "Cancel",
    delete_lease: "Delete lease",
    delete_lease_copy: "This will remove the lease, its tenant login, payment history, and related tickets. This action cannot be undone.",
    delete_ticket_copy: "This will permanently remove the selected maintenance ticket.",
    yes_continue: "Yes, continue",
    unknown_tenant: "Unknown tenant",
    submitted_by: "Submitted {date} by {name}",
    create_new_ticket: "Create New Ticket",
    create_ticket_copy: "New tickets are created as open until the property manager updates them.",
    water_heater: "Water Heater",
    air_conditioning: "Air Conditioning",
    plumbing: "Plumbing",
    other: "Other",
    ticket_placeholder: "Explain what is happening, where it is located, and how urgent it feels.",
    create_ticket: "Create ticket",
    make_payment_title: "Make a Payment",
    payment_modal_copy: "This prototype records the payment locally. Hook Stripe Checkout to go live.",
    monthly_rent: "Monthly rent",
    payment_architecture_note: "Recommended live architecture: create a Stripe Checkout Session on the server and redirect the tenant to the hosted payment page.",
    record_payment: "Record payment",
    login_error: "We could not match that email and password for the selected portal.",
    profile_updated: "Your tenant profile has been updated.",
    lease_updated: "Lease updated successfully.",
    lease_created: "Lease created and tenant access generated successfully.",
    lease_removed: "Lease removed.",
    ticket_submitted: "Your ticket was submitted and marked as open.",
    ticket_marked: "Ticket marked as {status}.",
    ticket_removed: "Ticket removed.",
    payment_recorded: "Payment recorded successfully.",
  },
  es: {
    welcome_brand: "CRH Condos • Coastal Rise Holdings LLC",
    welcome_title: "Administracion de renta con una imagen mas moderna y clara.",
    welcome_copy: "Un portal moderno para inquilinos y administracion donde se manejan contratos, tickets de mantenimiento y pagos desde un solo lugar.",
    lease_first: "Contrato central",
    lease_first_copy: "Inquilino, propiedad y terminos conectados en un solo registro.",
    stripe_ready: "Listo para Stripe",
    stripe_ready_copy: "Los pagos pueden pasar de modo demo a Checkout Sessions.",
    ticket_flow: "Flujo de tickets",
    ticket_flow_copy: "Los residentes reportan problemas rapido mientras la administracion mantiene el seguimiento visible.",
    welcome_to: "Bienvenido a CRH Condos",
    choose_portal: "Elige tu portal",
    choose_portal_copy: "Selecciona el tipo de acceso y luego ingresa tu correo y contrasena para continuar.",
    tenant_login: "Acceso Inquilino",
    tenant_login_copy: "Perfil, contrato, pagos, tickets",
    manager_login: "Acceso Administracion",
    manager_login_copy: "Contratos, reportes, pagos, tickets",
    email: "Correo electronico",
    password: "Contrasena",
    enter_password: "Ingresa tu contrasena",
    enter_portal: "Entrar",
    demo_accounts: "Cuentas demo",
    language: "Idioma",
    english: "Ingles",
    spanish: "Espanol",
    welcome: "Bienvenido",
    property_operations: "Operacion de Propiedades",
    lease_management: "Gestion de Contratos",
    tenant_tickets: "Tickets de Inquilinos",
    lease_payment_history: "Historial de Pagos de Contratos",
    tenant_profile: "Perfil del Inquilino",
    my_lease: "Mi Contrato",
    payments: "Pagos",
    my_tickets: "Mis Tickets",
    app_subtitle: "Una experiencia de renta moderna para Coastal Rise Holdings LLC.",
    admin_subtitle: "Administra contratos, monitorea pagos y mantén la operacion de residentes en un solo lugar.",
    tenant_subtitle: "Mantente al dia con tu contrato, solicitudes de mantenimiento y pagos desde un portal simple.",
    manager_console: "Panel Administrativo",
    tenant_portal: "Portal del Inquilino",
    log_out: "Cerrar sesion",
    create_lease: "Crear Contrato",
    create_ticket_plus: "Crear Ticket Nuevo+",
    home: "Inicio",
    leases: "Contratos",
    tickets: "Tickets",
    active_leases: "Contratos activos",
    active_leases_copy: "Actualmente ocupados y en curso.",
    inactive_leases: "Contratos inactivos",
    inactive_leases_copy: "Listos para renovacion, cambio o archivo.",
    payments_received: "Pagos recibidos",
    payments_received_copy: "Todos los pagos registrados de tus unidades.",
    open_tickets: "Tickets abiertos",
    open_tickets_copy: "Mantenimientos pendientes de accion.",
    lease_battery_view: "Vista de duracion de contratos",
    lease_battery_copy: "Lectura visual rapida del tiempo restante antes de que termine cada contrato.",
    portfolio_pulse: "Pulso del portafolio",
    portfolio_pulse_copy: "Resumen compacto para tener la semana clara y ordenada.",
    total_leases: "Total de contratos",
    total_leases_copy: "En todos los apartamentos administrados",
    tickets_closed: "Tickets cerrados",
    tickets_closed_copy: "Solicitudes de mantenimiento resueltas",
    average_monthly_rent: "Renta mensual promedio",
    average_monthly_rent_copy: "Promedio actual de contratos",
    days_left: "{days} dias restantes",
    ended: "Finalizado",
    new_lease: "Nuevo contrato",
    leases_copy: "Crea, revisa, edita o elimina cualquier contrato desde una sola tabla.",
    tenant: "Inquilino",
    property: "Propiedad",
    status: "Estado",
    term: "Periodo",
    monthly_cost: "Costo mensual",
    parking: "Estacionamiento",
    actions: "Acciones",
    payment_history: "Historial de Pagos",
    edit: "Editar",
    delete: "Eliminar",
    all_recorded_payments: "Todos los pagos registrados de los contratos{suffix}.",
    selected_lease_suffix: " para {name}",
    show_all_payments: "Ver todos los pagos",
    date: "Fecha",
    lease: "Contrato",
    description: "Descripcion",
    method: "Metodo",
    amount: "Monto",
    no_payments_for_lease: "Todavia no hay pagos registrados para este contrato.",
    tickets_copy: "Da seguimiento a solicitudes de mantenimiento y cierra el ciclo con los inquilinos de forma clara.",
    created: "Creado",
    nature: "Naturaleza",
    preview: "Vista previa",
    open: "Abrir",
    close_ticket: "Cerrar ticket",
    reopen: "Reabrir",
    no_tickets: "Todavia no se han creado tickets.",
    primary_tenant: "Inquilino principal",
    tenant_profile_copy: "Aqui puedes actualizar tu correo, telefono y contrasena.",
    first_name: "Nombre",
    last_name: "Apellido",
    phone: "Telefono",
    save_profile: "Guardar perfil",
    derivative_occupants: "Derivados",
    derivative_occupants_copy: "Se muestran aqui como parte de tu contrato. La edicion solo la hace administracion.",
    derivative_occupant: "Ocupante derivado",
    no_derivatives: "No hay derivados asociados a este contrato.",
    lease_overview: "Resumen del contrato",
    lease_overview_copy: "Esta seccion es solo lectura y coincide con la vista administrativa.",
    start_date: "Fecha de inicio",
    end_date: "Fecha de fin",
    deposit_made: "Deposito realizado",
    parking_spaces: "Espacios de estacionamiento",
    property_details: "Detalles de la propiedad",
    property_details_copy: "Tu residencia actual y los ocupantes registrados.",
    address: "Direccion",
    principal_tenant: "Inquilino principal",
    other_payments_recorded: "Otros pagos registrados al crear el contrato",
    no_derivatives_listed: "No hay derivados registrados",
    none_recorded: "No registrado",
    no_lease_attached: "No hay un contrato asociado actualmente a tu cuenta.",
    make_payment: "Realizar Pago",
    make_payment_copy: "Usa el boton de pago listo para Stripe para registrar tu siguiente pago.",
    suggested_amount: "Monto sugerido",
    payment_demo_copy: "En modo demo esto registra el pago al instante. Para produccion, conecta Stripe Checkout Sessions al endpoint configurado.",
    stripe_setup_status: "Estado de configuracion de Stripe",
    stripe_setup_copy: "Configuracion actual de pagos para este prototipo.",
    mode: "Modo",
    checkout_endpoint: "Endpoint de Checkout",
    publishable_key: "Clave publicable",
    not_configured: "Aun no configurado",
    payment_history_copy_tenant: "Aqui se muestra cada pago registrado en tu contrato.",
    no_payments_tenant: "No hay pagos registrados para tu contrato.",
    my_tickets_copy: "Revisa los problemas que reportaste y su estado actual.",
    describe_problem: "Describe el problema",
    no_tenant_tickets: "Todavia no has creado tickets de mantenimiento.",
    edit_lease: "Editar Contrato",
    create_lease_title: "Crear Contrato",
    lease_form_copy: "Las credenciales del inquilino principal crean o actualizan automaticamente el usuario con rol de inquilino.",
    close: "Cerrar",
    tenants_information: "Informacion de inquilinos",
    derivatives: "Derivados",
    derivatives_copy: "Agrega ocupantes adicionales cuando sea necesario.",
    add_derivatives: "Agregar+ Derivados",
    remove: "Quitar",
    property_information: "Informacion de la propiedad",
    street_address: "Calle y numero",
    unit_apartment: "Unidad / Apartamento",
    city: "Ciudad",
    state: "Estado",
    zip: "Codigo postal",
    lease_terms: "Terminos del contrato",
    active: "Activo",
    inactive: "Inactivo",
    open_status: "abierto",
    closed_status: "cerrado",
    other_payments_made: "Otros pagos realizados",
    other_payments_copy: "Agrega cargos o creditos adicionales registrados al crear el contrato.",
    add_payment: "Agregar pago",
    save_changes: "Guardar cambios",
    create_lease_button: "Crear contrato",
    cancel: "Cancelar",
    delete_lease: "Eliminar contrato",
    delete_lease_copy: "Esto eliminara el contrato, su acceso de inquilino, el historial de pagos y los tickets relacionados. Esta accion no se puede deshacer.",
    delete_ticket_copy: "Esto eliminara permanentemente el ticket de mantenimiento seleccionado.",
    yes_continue: "Si, continuar",
    unknown_tenant: "Inquilino desconocido",
    submitted_by: "Enviado el {date} por {name}",
    create_new_ticket: "Crear Ticket Nuevo",
    create_ticket_copy: "Los tickets nuevos se crean como abiertos hasta que administracion actualice su estado.",
    water_heater: "Calentador de Agua",
    air_conditioning: "Aire Acondicionado",
    plumbing: "Plomeria",
    other: "Otro",
    ticket_placeholder: "Explica que sucede, en que lugar ocurre y que tan urgente se siente.",
    create_ticket: "Crear ticket",
    make_payment_title: "Realizar Pago",
    payment_modal_copy: "Este prototipo registra el pago localmente. Conecta Stripe Checkout para salir en vivo.",
    monthly_rent: "Renta mensual",
    payment_architecture_note: "Arquitectura recomendada en vivo: crear una Checkout Session de Stripe en el servidor y redirigir al inquilino a la pagina de pago hospedada.",
    record_payment: "Registrar pago",
    login_error: "No pudimos encontrar un usuario con ese correo y contrasena para el portal seleccionado.",
    profile_updated: "Tu perfil de inquilino fue actualizado.",
    lease_updated: "El contrato fue actualizado correctamente.",
    lease_created: "El contrato fue creado y el acceso del inquilino se genero correctamente.",
    lease_removed: "Contrato eliminado.",
    ticket_submitted: "Tu ticket fue enviado y marcado como abierto.",
    ticket_marked: "Ticket marcado como {status}.",
    ticket_removed: "Ticket eliminado.",
    payment_recorded: "Pago registrado correctamente.",
  },
};

function currentLanguage() {
  return state.ui.language || "es";
}

function t(key, vars = {}) {
  const dict = I18N[currentLanguage()] || I18N.en;
  let value = dict[key] ?? I18N.en[key] ?? key;
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, replacement);
  });
  return value;
}

function seedData() {
  return {
    users: [
      {
        id: uid("user"),
        role: "admin",
        firstName: "Coastal",
        lastName: "Manager",
        phone: "(555) 210-4400",
        email: "admin@crhcondos.com",
        password: "admin123",
        leaseId: null,
      },
      {
        id: uid("user"),
        role: "tenant",
        firstName: "Mia",
        lastName: "Santos",
        phone: "(555) 101-9921",
        email: "mia@crhcondos.com",
        password: "tenant123",
        leaseId: "lease-seed-1",
      },
      {
        id: uid("user"),
        role: "tenant",
        firstName: "Julian",
        lastName: "Brooks",
        phone: "(555) 202-4471",
        email: "julian@crhcondos.com",
        password: "tenant123",
        leaseId: "lease-seed-2",
      },
    ],
    leases: [
      {
        id: "lease-seed-1",
        principalTenantUserId: null,
        principalTenant: {
          firstName: "Mia",
          lastName: "Santos",
          phone: "(555) 101-9921",
          email: "mia@crhcondos.com",
        },
        derivatives: [
          { id: uid("der"), firstName: "Leo", lastName: "Santos" },
        ],
        property: {
          street: "144 Oceanview Blvd",
          city: "Long Beach",
          state: "CA",
          zip: "90802",
          unit: "Unit 2A",
          parkingSpaces: "310, 311",
        },
        terms: {
          status: "Active",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          monthlyCost: 2950,
          depositMade: 2950,
          otherPayments: [
            { id: uid("other"), amount: 250, description: "Pet deposit" },
          ],
        },
      },
      {
        id: "lease-seed-2",
        principalTenantUserId: null,
        principalTenant: {
          firstName: "Julian",
          lastName: "Brooks",
          phone: "(555) 202-4471",
          email: "julian@crhcondos.com",
        },
        derivatives: [],
        property: {
          street: "98 Harbor Crest Dr",
          city: "Long Beach",
          state: "CA",
          zip: "90803",
          unit: "Unit 5C",
          parkingSpaces: "112",
        },
        terms: {
          status: "Inactive",
          startDate: "2025-03-01",
          endDate: "2026-03-31",
          monthlyCost: 3225,
          depositMade: 3225,
          otherPayments: [],
        },
      },
    ],
    payments: [
      {
        id: uid("pay"),
        leaseId: "lease-seed-1",
        tenantUserId: null,
        date: "2026-04-01",
        amount: 2950,
        method: "ACH via Stripe",
        description: "April rent",
        status: "Paid",
      },
      {
        id: uid("pay"),
        leaseId: "lease-seed-1",
        tenantUserId: null,
        date: "2026-03-01",
        amount: 2950,
        method: "Card via Stripe",
        description: "March rent",
        status: "Paid",
      },
      {
        id: uid("pay"),
        leaseId: "lease-seed-2",
        tenantUserId: null,
        date: "2026-03-01",
        amount: 3225,
        method: "Card via Stripe",
        description: "Final rent cycle",
        status: "Paid",
      },
    ],
    tickets: [
      {
        id: uid("ticket"),
        leaseId: "lease-seed-1",
        tenantUserId: null,
        nature: "Air Conditioning",
        description: "The bedroom vent is blowing warm air after 7pm and the room does not cool down.",
        status: "Open",
        createdAt: "2026-04-08",
      },
      {
        id: uid("ticket"),
        leaseId: "lease-seed-2",
        tenantUserId: null,
        nature: "Plumbing",
        description: "Kitchen sink is draining slowly even after basic cleaning.",
        status: "Closed",
        createdAt: "2026-03-15",
      },
    ],
    stripe: {
      publishableKey: "",
      checkoutEndpoint: "/api/create-checkout-session",
      mode: "demo",
    },
  };
}

hydrateRelationships(state.data);

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    hydrateRelationships(parsed.data);
    return parsed;
  } catch (error) {
    console.warn("Falling back to seed data due to invalid saved state.", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function hydrateRelationships(data) {
  data.leases.forEach((lease) => {
    const user = data.users.find(
      (entry) =>
        entry.role === "tenant" &&
        entry.email.toLowerCase() === lease.principalTenant.email.toLowerCase()
    );
    if (user) {
      lease.principalTenantUserId = user.id;
      user.leaseId = lease.id;
    }
  });

  data.payments.forEach((payment) => {
    if (!payment.tenantUserId) {
      const lease = data.leases.find((item) => item.id === payment.leaseId);
      payment.tenantUserId = lease?.principalTenantUserId ?? null;
    }
  });

  data.tickets.forEach((ticket) => {
    if (!ticket.tenantUserId) {
      const lease = data.leases.find((item) => item.id === ticket.leaseId);
      ticket.tenantUserId = lease?.principalTenantUserId ?? null;
    }
  });
}

function setState(updater) {
  updater(state);
  saveState();
  renderApp();
}

function setFlash(message) {
  setState((draft) => {
    draft.ui.flash = message;
  });
}

function getCurrentUser() {
  return state.data.users.find((user) => user.id === state.session.userId) ?? null;
}

function getLeaseByUser(userId) {
  return state.data.leases.find((lease) => lease.principalTenantUserId === userId) ?? null;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function localizeStatus(value) {
  const map = {
    Active: t("active"),
    Inactive: t("inactive"),
    Open: currentLanguage() === "es" ? "Abierto" : "Open",
    Closed: currentLanguage() === "es" ? "Cerrado" : "Closed",
    Paid: currentLanguage() === "es" ? "Pagado" : "Paid",
    demo: currentLanguage() === "es" ? "demo" : "demo",
    live: currentLanguage() === "es" ? "en vivo" : "live",
  };
  return map[value] || value;
}

function pageTitle() {
  const user = getCurrentUser();
  if (!user) return t("welcome");

  const titles = {
    admin: {
      home: t("property_operations"),
      leases: t("lease_management"),
      tickets: t("tenant_tickets"),
      payments: t("lease_payment_history"),
    },
    tenant: {
      profile: t("tenant_profile"),
      lease: t("my_lease"),
      payments: t("payments"),
      tickets: t("my_tickets"),
    },
  };

  return titles[user.role]?.[state.session.page] ?? "CRH Condos";
}

function pageSubtitle() {
  const user = getCurrentUser();
  if (!user) return t("app_subtitle");
  if (user.role === "admin") {
    return t("admin_subtitle");
  }
  return t("tenant_subtitle");
}

function renderLanguageSwitch() {
  return `
    <div class="language-switch" aria-label="${safeText(t("language"))}">
      <button class="language-button ${currentLanguage() === "en" ? "active" : ""}" type="button" data-action="set-language" data-id="en">${safeText(t("english"))}</button>
      <button class="language-button ${currentLanguage() === "es" ? "active" : ""}" type="button" data-action="set-language" data-id="es">${safeText(t("spanish"))}</button>
    </div>
  `;
}

function renderApp() {
  const app = document.getElementById("app");
  if (!state.session.role) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
    return;
  }

  app.innerHTML = renderPortal();
  bindPortalEvents();
}

function renderWelcome() {
  const error = state.ui.loginError
    ? `<div class="error-banner">${safeText(state.ui.loginError)}</div>`
    : "";

  return `
    <div class="welcome-shell">
      <section class="welcome-panel login-card">
        <div>
          <div class="login-topbar">
            <span class="mini-chip">${safeText(t("welcome_to"))}</span>
            ${renderLanguageSwitch()}
          </div>
          <h2 class="auth-title">${safeText(t("choose_portal"))}</h2>
          <p class="section-copy">${safeText(t("choose_portal_copy"))}</p>
        </div>
        <div class="role-switch">
          ${renderRoleOption("tenant", t("tenant_login"), t("tenant_login_copy"))}
          ${renderRoleOption("admin", t("manager_login"), t("manager_login_copy"))}
        </div>
        <form id="login-form" class="form-grid">
          <div class="field">
            <label for="login-email">${safeText(t("email"))}</label>
            <input id="login-email" name="email" type="email" placeholder="you@crhcondos.com" required>
          </div>
          <div class="field">
            <label for="login-password">${safeText(t("password"))}</label>
            <input id="login-password" name="password" type="password" placeholder="${safeText(t("enter_password"))}" required>
          </div>
          <div class="login-actions">
            <button class="primary-button" type="submit">${safeText(t("enter_portal"))}</button>
          </div>
          ${error}
        </form>
        <div class="inline-note" style="margin-top:18px;">
          ${safeText(t("demo_accounts"))}: <strong>admin@crhcondos.com / admin123</strong>,
          <strong>mia@crhcondos.com / tenant123</strong>, or
          <strong>julian@crhcondos.com / tenant123</strong>.
        </div>
      </section>
    </div>
  `;
}

function renderRoleOption(role, title, caption) {
  const active = state.ui.authRole === role ? "active" : "";
  return `
    <button class="role-option ${active}" type="button" data-role="${role}">
      <strong>${safeText(title)}</strong>
      <div class="muted" style="margin-top:6px;">${safeText(caption)}</div>
    </button>
  `;
}

function renderPortal() {
  const user = getCurrentUser();
  const content = user.role === "admin" ? renderAdminPage() : renderTenantPage();
  const flash = state.ui.flash ? `<div class="success-banner">${safeText(state.ui.flash)}</div>` : "";

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="mini-chip">CRH Condos</span>
          <strong>${user.role === "admin" ? safeText(t("manager_console")) : safeText(t("tenant_portal"))}</strong>
          <span class="muted">${safeText(user.firstName)} ${safeText(user.lastName)}</span>
        </div>
        <nav class="nav-group">
          ${renderNav(user.role)}
        </nav>
        <div class="sidebar-footer">
          <button class="ghost-button" type="button" data-action="logout">${safeText(t("log_out"))}</button>
        </div>
      </aside>
      <main class="content-shell">
        <section class="topbar">
          <div>
            <h1 class="section-title">${safeText(pageTitle())}</h1>
            <p class="section-copy">${safeText(pageSubtitle())}</p>
          </div>
          <div class="topbar-actions">
            ${renderLanguageSwitch()}
            ${user.role === "admin"
              ? `<button class="primary-button" type="button" data-action="open-create-lease">${safeText(t("create_lease"))}</button>`
              : `<button class="primary-button" type="button" data-action="open-ticket-create">${safeText(t("create_ticket_plus"))}</button>`}
          </div>
        </section>
        ${flash}
        ${content}
      </main>
    </div>
    ${renderModal()}
  `;
}

function renderNav(role) {
  const adminItems = [
    ["home", t("home")],
    ["leases", t("leases")],
    ["tickets", t("tickets")],
    ["payments", t("payments")],
  ];
  const tenantItems = [
    ["profile", t("tenant_profile")],
    ["lease", t("my_lease")],
    ["payments", t("payments")],
    ["tickets", t("my_tickets")],
  ];

  return (role === "admin" ? adminItems : tenantItems)
    .map(
      ([page, label]) => `
      <button class="nav-button ${state.session.page === page ? "active" : ""}" type="button" data-page="${page}">
        ${safeText(label)}
      </button>
    `
    )
    .join("");
}

function renderAdminPage() {
  const page = state.session.page;
  if (page === "leases") return renderAdminLeases();
  if (page === "tickets") return renderAdminTickets();
  if (page === "payments") return renderAdminPayments();
  return renderAdminHome();
}

function renderTenantPage() {
  const page = state.session.page;
  if (page === "profile") return renderTenantProfile();
  if (page === "lease") return renderTenantLease();
  if (page === "tickets") return renderTenantTickets();
  return renderTenantPayments();
}

function renderAdminHome() {
  const leases = state.data.leases;
  const payments = state.data.payments;
  const activeCount = leases.filter((lease) => lease.terms.status === "Active").length;
  const inactiveCount = leases.length - activeCount;
  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const openTickets = state.data.tickets.filter((ticket) => ticket.status === "Open").length;

  return `
    <div class="page-grid">
      <section class="metrics-grid">
        <div class="metric-card accent-blue">
          <span class="metric-label">${safeText(t("active_leases"))}</span>
          <strong class="metric-value">${activeCount}</strong>
          <span class="muted">${safeText(t("active_leases_copy"))}</span>
        </div>
        <div class="metric-card accent-red">
          <span class="metric-label">${safeText(t("inactive_leases"))}</span>
          <strong class="metric-value">${inactiveCount}</strong>
          <span class="muted">${safeText(t("inactive_leases_copy"))}</span>
        </div>
        <div class="metric-card accent-green">
          <span class="metric-label">${safeText(t("payments_received"))}</span>
          <strong class="metric-value">${formatCurrency(totalPayments)}</strong>
          <span class="muted">${safeText(t("payments_received_copy"))}</span>
        </div>
        <div class="metric-card accent-orange">
          <span class="metric-label">${safeText(t("open_tickets"))}</span>
          <strong class="metric-value">${openTickets}</strong>
          <span class="muted">${safeText(t("open_tickets_copy"))}</span>
        </div>
      </section>
      <section class="report-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("lease_battery_view"))}</h2>
              <p class="section-copy">${safeText(t("lease_battery_copy"))}</p>
            </div>
          </div>
          <div class="list-stack">
            ${leases.map(renderLeaseTimerCard).join("")}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("portfolio_pulse"))}</h2>
              <p class="section-copy">${safeText(t("portfolio_pulse_copy"))}</p>
            </div>
          </div>
          <div class="list-stack">
            ${renderHomeSummaryCard(t("total_leases"), leases.length, t("total_leases_copy"))}
            ${renderHomeSummaryCard(t("tickets_closed"), state.data.tickets.filter((ticket) => ticket.status === "Closed").length, t("tickets_closed_copy"))}
            ${renderHomeSummaryCard(t("average_monthly_rent"), formatCurrency(avgMonthlyCost()), t("average_monthly_rent_copy"))}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderHomeSummaryCard(label, value, caption) {
  return `
    <div class="info-card">
      <span class="metric-label">${safeText(label)}</span>
      <strong class="metric-value">${safeText(value)}</strong>
      <span class="muted">${safeText(caption)}</span>
    </div>
  `;
}

function avgMonthlyCost() {
  if (!state.data.leases.length) return 0;
  const total = state.data.leases.reduce((sum, lease) => sum + Number(lease.terms.monthlyCost), 0);
  return total / state.data.leases.length;
}

function renderLeaseTimerCard(lease) {
  const progress = leaseProgress(lease);
  return `
    <div class="lease-timer">
      <div class="split-header">
        <div>
          <strong>${safeText(lease.principalTenant.firstName)} ${safeText(lease.principalTenant.lastName)}</strong>
          <div class="muted">${safeText(fullAddress(lease.property))}</div>
        </div>
        <span class="status-pill ${lease.terms.status === "Active" ? "status-active" : "status-inactive"}">
          ${safeText(localizeStatus(lease.terms.status))}
        </span>
      </div>
      <div class="list-highlight">${progress.daysLeft > 0 ? safeText(t("days_left", { days: String(progress.daysLeft) })) : safeText(t("ended"))}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${progress.percent}%;"></div></div>
      <div class="fine-print" style="margin-top:10px;">
        ${safeText(formatDate(lease.terms.startDate))} to ${safeText(formatDate(lease.terms.endDate))}
      </div>
    </div>
  `;
}

function leaseProgress(lease) {
  const today = new Date();
  const start = new Date(`${lease.terms.startDate}T00:00:00`);
  const end = new Date(`${lease.terms.endDate}T00:00:00`);
  const total = Math.max(1, end - start);
  const elapsed = Math.min(Math.max(today - start, 0), total);
  const percent = Math.max(6, Math.round((elapsed / total) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));
  return { percent, daysLeft };
}

function renderAdminLeases() {
  return `
    <div class="page-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${safeText(t("leases"))}</h2>
            <p class="section-copy">${safeText(t("leases_copy"))}</p>
          </div>
          <button class="primary-button" type="button" data-action="open-create-lease">${safeText(t("new_lease"))}</button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>${safeText(t("tenant"))}</th>
                <th>${safeText(t("property"))}</th>
                <th>${safeText(t("status"))}</th>
                <th>${safeText(t("term"))}</th>
                <th>${safeText(t("monthly_cost"))}</th>
                <th>${safeText(t("parking"))}</th>
                <th>${safeText(t("actions"))}</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.leases.map(renderLeaseTableRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderLeaseTableRow(lease) {
  return `
    <tr>
      <td>
        <strong>${safeText(lease.principalTenant.firstName)} ${safeText(lease.principalTenant.lastName)}</strong>
        <div class="fine-print">${safeText(lease.principalTenant.email)}</div>
      </td>
      <td>${safeText(fullAddress(lease.property))}</td>
      <td>
        <span class="status-pill ${lease.terms.status === "Active" ? "status-active" : "status-inactive"}">
          ${safeText(localizeStatus(lease.terms.status))}
        </span>
      </td>
      <td>${safeText(formatDate(lease.terms.startDate))}<br><span class="fine-print">to ${safeText(formatDate(lease.terms.endDate))}</span></td>
      <td>${safeText(formatCurrency(lease.terms.monthlyCost))}</td>
      <td>${safeText(lease.property.parkingSpaces || "—")}</td>
      <td>
        <div class="action-group">
          <button class="action-button" type="button" data-action="lease-payments" data-id="${lease.id}">${safeText(t("payment_history"))}</button>
          <button class="action-button" type="button" data-action="edit-lease" data-id="${lease.id}">${safeText(t("edit"))}</button>
          <button class="action-button danger" type="button" data-action="delete-lease" data-id="${lease.id}">${safeText(t("delete"))}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderAdminPayments() {
  const leaseFilterId = state.ui.paymentLeaseFilter;
  const payments = leaseFilterId
    ? state.data.payments.filter((payment) => payment.leaseId === leaseFilterId)
    : state.data.payments;
  const filteredLease = leaseFilterId
    ? state.data.leases.find((item) => item.id === leaseFilterId)
    : null;

  return `
    <div class="page-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${safeText(t("payment_history"))}</h2>
            <p class="section-copy">${safeText(t("all_recorded_payments", {
              suffix: leaseFilterId
                ? t("selected_lease_suffix", {
                    name: `${filteredLease?.principalTenant?.firstName || ""} ${filteredLease?.principalTenant?.lastName || ""}`.trim()
                  })
                : ""
            }))}</p>
          </div>
          ${leaseFilterId ? `<button class="ghost-button" type="button" data-action="clear-payment-filter">${safeText(t("show_all_payments"))}</button>` : ""}
        </div>
        ${payments.length
          ? `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>${safeText(t("date"))}</th>
                  <th>${safeText(t("tenant"))}</th>
                  <th>${safeText(t("lease"))}</th>
                  <th>${safeText(t("description"))}</th>
                  <th>${safeText(t("method"))}</th>
                  <th>${safeText(t("amount"))}</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(renderPaymentRow).join("")}
              </tbody>
            </table>
          </div>
          `
          : `<div class="empty-state">${safeText(t("no_payments_for_lease"))}</div>`}
      </section>
    </div>
  `;
}

function renderPaymentRow(payment) {
  const lease = state.data.leases.find((item) => item.id === payment.leaseId);
  return `
    <tr>
      <td>${safeText(formatDate(payment.date))}</td>
      <td>${safeText(lease ? `${lease.principalTenant.firstName} ${lease.principalTenant.lastName}` : "Unknown")}</td>
      <td>${safeText(lease ? lease.property.unit : "—")}</td>
      <td>${safeText(payment.description)}</td>
      <td>${safeText(payment.method)}</td>
      <td>${safeText(formatCurrency(payment.amount))}</td>
    </tr>
  `;
}

function renderAdminTickets() {
  return `
    <div class="page-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${safeText(t("tickets"))}</h2>
            <p class="section-copy">${safeText(t("tickets_copy"))}</p>
          </div>
        </div>
        ${state.data.tickets.length
          ? `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>${safeText(t("created"))}</th>
                  <th>${safeText(t("tenant"))}</th>
                  <th>${safeText(t("nature"))}</th>
                  <th>${safeText(t("status"))}</th>
                  <th>${safeText(t("preview"))}</th>
                  <th>${safeText(t("actions"))}</th>
                </tr>
              </thead>
              <tbody>
                ${state.data.tickets.map(renderAdminTicketRow).join("")}
              </tbody>
            </table>
          </div>
          `
          : `<div class="empty-state">${safeText(t("no_tickets"))}</div>`}
      </section>
    </div>
  `;
}

function renderAdminTicketRow(ticket) {
  const lease = state.data.leases.find((item) => item.id === ticket.leaseId);
  const tenantName = lease
    ? `${lease.principalTenant.firstName} ${lease.principalTenant.lastName}`
    : "Unknown";

  return `
    <tr>
      <td>${safeText(formatDate(ticket.createdAt))}</td>
      <td>${safeText(tenantName)}</td>
      <td>${safeText(ticket.nature)}</td>
      <td>
        <span class="status-pill ${ticket.status === "Open" ? "status-open" : "status-closed"}">
          ${safeText(localizeStatus(ticket.status))}
        </span>
      </td>
      <td>${safeText(ticket.description.slice(0, 70))}${ticket.description.length > 70 ? "..." : ""}</td>
      <td>
        <div class="action-group">
          <button class="action-button" type="button" data-action="open-ticket-view" data-id="${ticket.id}">${safeText(t("open"))}</button>
          <button class="action-button" type="button" data-action="toggle-ticket" data-id="${ticket.id}">
            ${ticket.status === "Open" ? safeText(t("close_ticket")) : safeText(t("reopen"))}
          </button>
          <button class="action-button danger" type="button" data-action="delete-ticket" data-id="${ticket.id}">${safeText(t("delete"))}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderTenantProfile() {
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);

  return `
    <div class="page-grid">
      <section class="profile-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("primary_tenant"))}</h2>
              <p class="section-copy">${safeText(t("tenant_profile_copy"))}</p>
            </div>
          </div>
          <form id="tenant-profile-form" class="form-grid">
            <div class="field">
              <label>${safeText(t("first_name"))}</label>
              <input type="text" value="${safeText(user.firstName)}" disabled>
            </div>
            <div class="field">
              <label>${safeText(t("last_name"))}</label>
              <input type="text" value="${safeText(user.lastName)}" disabled>
            </div>
            <div class="field">
              <label>${safeText(t("email"))}</label>
              <input name="email" type="email" value="${safeText(user.email)}" required>
            </div>
            <div class="field">
              <label>${safeText(t("phone"))}</label>
              <input name="phone" type="text" value="${safeText(user.phone)}" required>
            </div>
            <div class="field">
              <label>${safeText(t("password"))}</label>
              <input name="password" type="password" value="${safeText(user.password)}" required>
            </div>
            <div>
              <button class="primary-button" type="submit">${safeText(t("save_profile"))}</button>
            </div>
          </form>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("derivative_occupants"))}</h2>
              <p class="section-copy">${safeText(t("derivative_occupants_copy"))}</p>
            </div>
          </div>
          ${lease?.derivatives?.length
            ? `
            <div class="list-stack">
              ${lease.derivatives
                .map(
                  (item) => `
                <div class="info-card">
                  <strong>${safeText(item.firstName)} ${safeText(item.lastName)}</strong>
                  <span class="muted">${safeText(t("derivative_occupant"))}</span>
                </div>
              `
                )
                .join("")}
            </div>
            `
            : `<div class="empty-state">${safeText(t("no_derivatives"))}</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderTenantLease() {
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);
  if (!lease) {
    return `<div class="panel"><div class="empty-state">${safeText(t("no_lease_attached"))}</div></div>`;
  }

  return `
    <div class="page-grid">
      <section class="section-card-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("lease_overview"))}</h2>
              <p class="section-copy">${safeText(t("lease_overview_copy"))}</p>
            </div>
          </div>
          <div class="detail-list">
            <div class="detail-item">
              <strong>${safeText(t("status"))}</strong>
              <span>${safeText(localizeStatus(lease.terms.status))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("monthly_cost"))}</strong>
              <span>${safeText(formatCurrency(lease.terms.monthlyCost))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("start_date"))}</strong>
              <span>${safeText(formatDate(lease.terms.startDate))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("end_date"))}</strong>
              <span>${safeText(formatDate(lease.terms.endDate))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("deposit_made"))}</strong>
              <span>${safeText(formatCurrency(lease.terms.depositMade))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("parking_spaces"))}</strong>
              <span>${safeText(lease.property.parkingSpaces || "—")}</span>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("property_details"))}</h2>
              <p class="section-copy">${safeText(t("property_details_copy"))}</p>
            </div>
          </div>
          <div class="list-stack">
            <div class="detail-item">
              <strong>${safeText(t("address"))}</strong>
              <span>${safeText(fullAddress(lease.property))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("principal_tenant"))}</strong>
              <span>${safeText(lease.principalTenant.firstName)} ${safeText(lease.principalTenant.lastName)}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("email"))}</strong>
              <span>${safeText(lease.principalTenant.email)}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("phone"))}</strong>
              <span>${safeText(lease.principalTenant.phone)}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <strong>${safeText(t("derivative_occupants"))}</strong>
              <span>${lease.derivatives.length
                ? safeText(lease.derivatives.map((item) => `${item.firstName} ${item.lastName}`).join(", "))
                : safeText(t("no_derivatives_listed"))}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <strong>${safeText(t("other_payments_recorded"))}</strong>
              <span>${lease.terms.otherPayments.length
                ? safeText(lease.terms.otherPayments.map((item) => `${formatCurrency(item.amount)} for ${item.description}`).join(" • "))
                : safeText(t("none_recorded"))}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTenantPayments() {
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);
  const payments = state.data.payments.filter((payment) => payment.tenantUserId === user.id);
  const due = lease ? Number(lease.terms.monthlyCost) : 0;

  return `
    <div class="page-grid">
      <section class="section-card-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("make_payment"))}</h2>
              <p class="section-copy">${safeText(t("make_payment_copy"))}</p>
            </div>
          </div>
          <div class="payment-card">
            <span class="metric-label">${safeText(t("suggested_amount"))}</span>
            <strong class="metric-value">${safeText(formatCurrency(due))}</strong>
            <p class="muted">${safeText(t("payment_demo_copy"))}</p>
            <div class="button-row">
              <button class="primary-button" type="button" data-action="make-payment">${safeText(t("make_payment"))}</button>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">${safeText(t("stripe_setup_status"))}</h2>
              <p class="section-copy">${safeText(t("stripe_setup_copy"))}</p>
            </div>
          </div>
          <div class="detail-list">
            <div class="detail-item">
              <strong>${safeText(t("mode"))}</strong>
              <span>${safeText(localizeStatus(state.data.stripe.mode))}</span>
            </div>
            <div class="detail-item">
              <strong>${safeText(t("checkout_endpoint"))}</strong>
              <span>${safeText(state.data.stripe.checkoutEndpoint)}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <strong>${safeText(t("publishable_key"))}</strong>
              <span>${safeText(state.data.stripe.publishableKey || t("not_configured"))}</span>
            </div>
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${safeText(t("payment_history"))}</h2>
            <p class="section-copy">${safeText(t("payment_history_copy_tenant"))}</p>
          </div>
        </div>
        ${payments.length
          ? `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>${safeText(t("date"))}</th>
                  <th>${safeText(t("description"))}</th>
                  <th>${safeText(t("method"))}</th>
                  <th>${safeText(t("status"))}</th>
                  <th>${safeText(t("amount"))}</th>
                </tr>
              </thead>
              <tbody>
                ${payments
                  .map(
                    (payment) => `
                  <tr>
                    <td>${safeText(formatDate(payment.date))}</td>
                    <td>${safeText(payment.description)}</td>
                    <td>${safeText(payment.method)}</td>
                    <td><span class="status-pill ${payment.status === "Paid" ? "status-paid" : "status-pending"}">${safeText(localizeStatus(payment.status))}</span></td>
                    <td>${safeText(formatCurrency(payment.amount))}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
          : `<div class="empty-state">${safeText(t("no_payments_tenant"))}</div>`}
      </section>
    </div>
  `;
}

function renderTenantTickets() {
  const user = getCurrentUser();
  const tickets = state.data.tickets.filter((ticket) => ticket.tenantUserId === user.id);

  return `
    <div class="page-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${safeText(t("my_tickets"))}</h2>
            <p class="section-copy">${safeText(t("my_tickets_copy"))}</p>
          </div>
          <button class="primary-button" type="button" data-action="open-ticket-create">${safeText(t("create_ticket_plus"))}</button>
        </div>
        ${tickets.length
          ? `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>${safeText(t("created"))}</th>
                  <th>${safeText(t("nature"))}</th>
                  <th>${safeText(t("status"))}</th>
                  <th>${safeText(t("describe_problem"))}</th>
                </tr>
              </thead>
              <tbody>
                ${tickets
                  .map(
                    (ticket) => `
                  <tr>
                    <td>${safeText(formatDate(ticket.createdAt))}</td>
                    <td>${safeText(ticket.nature)}</td>
                    <td><span class="status-pill ${ticket.status === "Open" ? "status-open" : "status-closed"}">${safeText(localizeStatus(ticket.status))}</span></td>
                    <td>${safeText(ticket.description)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
          : `<div class="empty-state">${safeText(t("no_tenant_tickets"))}</div>`}
      </section>
    </div>
  `;
}

function renderModal() {
  const modal = state.ui.modal;
  if (!modal) return "";

  if (modal.type === "lease-form") return renderLeaseFormModal(modal.leaseId);
  if (modal.type === "confirm") return renderConfirmModal(modal);
  if (modal.type === "ticket-view") return renderTicketViewModal(modal.ticketId);
  if (modal.type === "ticket-form") return renderTicketFormModal();
  if (modal.type === "payment-form") return renderPaymentFormModal();
  return "";
}

function renderLeaseFormModal(leaseId) {
  const lease = leaseId ? state.data.leases.find((item) => item.id === leaseId) : null;
  const principal = lease?.principalTenant ?? { firstName: "", lastName: "", phone: "", email: "" };
  const user = lease?.principalTenantUserId
    ? state.data.users.find((item) => item.id === lease.principalTenantUserId)
    : null;
  const property = lease?.property ?? { street: "", city: "", state: "", zip: "", unit: "", parkingSpaces: "" };
  const terms = lease?.terms ?? {
    status: "Active",
    startDate: "",
    endDate: "",
    monthlyCost: "",
    depositMade: "",
    otherPayments: [{ id: uid("other"), amount: "", description: "" }],
  };
  const derivatives = lease?.derivatives?.length ? lease.derivatives : [{ id: uid("der"), firstName: "", lastName: "" }];
  const otherPayments = terms.otherPayments.length ? terms.otherPayments : [{ id: uid("other"), amount: "", description: "" }];

  return `
    <div class="modal-overlay" data-close-modal="true">
      <div class="modal-card" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">${lease ? safeText(t("edit_lease")) : safeText(t("create_lease_title"))}</h2>
            <p class="section-copy">${safeText(t("lease_form_copy"))}</p>
          </div>
          <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("close"))}</button>
        </div>
        <form id="lease-form" class="subgrid">
          <input type="hidden" name="leaseId" value="${safeText(lease?.id || "")}">
          <section class="panel" style="padding:20px;">
            <h3 class="section-title" style="font-size:1.2rem;">${safeText(t("tenants_information"))}</h3>
            <div class="form-grid two" style="margin-top:16px;">
              <div class="field">
                <label>${safeText(t("first_name"))}</label>
                <input name="tenantFirstName" value="${safeText(principal.firstName)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("last_name"))}</label>
                <input name="tenantLastName" value="${safeText(principal.lastName)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("phone"))}</label>
                <input name="tenantPhone" value="${safeText(principal.phone)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("email"))}</label>
                <input name="tenantEmail" type="email" value="${safeText(principal.email)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("password"))}</label>
                <input name="tenantPassword" type="text" value="${safeText(user?.password || "")}" required>
              </div>
            </div>
            <div class="section-divider"></div>
            <div class="split-header">
              <div>
                <h3 class="section-title" style="font-size:1.2rem;">${safeText(t("derivatives"))}</h3>
                <p class="section-copy">${safeText(t("derivatives_copy"))}</p>
              </div>
              <button class="ghost-button" type="button" data-action="add-derivative">${safeText(t("add_derivatives"))}</button>
            </div>
            <div id="derivative-list" class="stack">
              ${derivatives.map(renderDerivativeInputs).join("")}
            </div>
          </section>

          <section class="panel" style="padding:20px;">
            <h3 class="section-title" style="font-size:1.2rem;">${safeText(t("property_information"))}</h3>
            <div class="form-grid two" style="margin-top:16px;">
              <div class="field">
                <label>${safeText(t("street_address"))}</label>
                <input name="street" value="${safeText(property.street)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("unit_apartment"))}</label>
                <input name="unit" value="${safeText(property.unit)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("city"))}</label>
                <input name="city" value="${safeText(property.city)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("state"))}</label>
                <input name="state" value="${safeText(property.state)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("zip"))}</label>
                <input name="zip" value="${safeText(property.zip)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("parking_spaces"))}</label>
                <input name="parkingSpaces" value="${safeText(property.parkingSpaces)}" placeholder="310, 311">
              </div>
            </div>
          </section>

          <section class="panel" style="padding:20px;">
            <h3 class="section-title" style="font-size:1.2rem;">${safeText(t("lease_terms"))}</h3>
            <div class="form-grid two" style="margin-top:16px;">
              <div class="field">
                <label>${safeText(t("status"))}</label>
                <select name="status">
                  <option value="Active" ${terms.status === "Active" ? "selected" : ""}>${safeText(t("active"))}</option>
                  <option value="Inactive" ${terms.status === "Inactive" ? "selected" : ""}>${safeText(t("inactive"))}</option>
                </select>
              </div>
              <div class="field">
                <label>${safeText(t("monthly_cost"))}</label>
                <input name="monthlyCost" type="number" min="0" step="0.01" value="${safeText(terms.monthlyCost)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("start_date"))}</label>
                <input name="startDate" type="date" value="${safeText(terms.startDate)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("end_date"))}</label>
                <input name="endDate" type="date" value="${safeText(terms.endDate)}" required>
              </div>
              <div class="field">
                <label>${safeText(t("deposit_made"))}</label>
                <input name="depositMade" type="number" min="0" step="0.01" value="${safeText(terms.depositMade)}" required>
              </div>
            </div>
            <div class="section-divider"></div>
            <div class="split-header">
              <div>
                <h3 class="section-title" style="font-size:1.2rem;">${safeText(t("other_payments_made"))}</h3>
                <p class="section-copy">${safeText(t("other_payments_copy"))}</p>
              </div>
              <button class="ghost-button" type="button" data-action="add-other-payment">${safeText(t("add_payment"))}</button>
            </div>
            <div id="other-payment-list" class="stack">
              ${otherPayments.map(renderOtherPaymentInputs).join("")}
            </div>
          </section>

          <div class="button-row">
            <button class="primary-button" type="submit">${lease ? safeText(t("save_changes")) : safeText(t("create_lease_button"))}</button>
            <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("cancel"))}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderDerivativeInputs(item) {
  return `
    <div class="derivative-item" data-derivative-id="${item.id}">
      <div class="field">
        <label>${safeText(t("first_name"))}</label>
        <input name="derivativeFirstName" value="${safeText(item.firstName)}">
      </div>
      <div class="field">
        <label>${safeText(t("last_name"))}</label>
        <input name="derivativeLastName" value="${safeText(item.lastName)}">
      </div>
      <button class="danger-button" type="button" data-action="remove-derivative" data-id="${item.id}">${safeText(t("remove"))}</button>
    </div>
  `;
}

function renderOtherPaymentInputs(item) {
  return `
    <div class="payment-item" data-other-payment-id="${item.id}">
      <div class="field">
        <label>${safeText(t("amount"))}</label>
        <input name="otherPaymentAmount" type="number" min="0" step="0.01" value="${safeText(item.amount)}">
      </div>
      <div class="field">
        <label>${safeText(t("description"))}</label>
        <input name="otherPaymentDescription" value="${safeText(item.description)}">
      </div>
      <button class="danger-button" type="button" data-action="remove-other-payment" data-id="${item.id}">${safeText(t("remove"))}</button>
    </div>
  `;
}

function renderConfirmModal(modal) {
  return `
    <div class="modal-overlay" data-close-modal="true">
      <div class="modal-card small" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">${safeText(modal.title)}</h2>
            <p class="section-copy">${safeText(modal.message)}</p>
          </div>
        </div>
        <div class="button-row">
          <button class="danger-button" type="button" data-action="confirm-modal">${safeText(t("yes_continue"))}</button>
          <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("cancel"))}</button>
        </div>
      </div>
    </div>
  `;
}

function renderTicketViewModal(ticketId) {
  const ticket = state.data.tickets.find((item) => item.id === ticketId);
  if (!ticket) return "";
  const lease = state.data.leases.find((item) => item.id === ticket.leaseId);
  return `
    <div class="modal-overlay" data-close-modal="true">
      <div class="modal-card small" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">${safeText(ticket.nature)}</h2>
            <p class="section-copy">${safeText(t("submitted_by", {
    date: formatDate(ticket.createdAt),
    name: lease ? `${lease.principalTenant.firstName} ${lease.principalTenant.lastName}` : t("unknown_tenant")
  }))}</p>
          </div>
          <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("close"))}</button>
        </div>
        <div class="detail-item">
          <strong>${safeText(t("status"))}</strong>
          <span>${safeText(localizeStatus(ticket.status))}</span>
        </div>
        <div class="detail-item" style="margin-top:12px;">
          <strong>${safeText(t("describe_problem"))}</strong>
          <span>${safeText(ticket.description)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTicketFormModal() {
  return `
    <div class="modal-overlay" data-close-modal="true">
      <div class="modal-card small" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">${safeText(t("create_new_ticket"))}</h2>
            <p class="section-copy">${safeText(t("create_ticket_copy"))}</p>
          </div>
          <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("close"))}</button>
        </div>
        <form id="ticket-form" class="form-grid">
          <div class="field">
            <label>${safeText(t("nature"))}</label>
            <select name="nature" required>
              <option value="Water Heater">${safeText(t("water_heater"))}</option>
              <option value="Air Conditioning">${safeText(t("air_conditioning"))}</option>
              <option value="Plumbing">${safeText(t("plumbing"))}</option>
              <option value="Other">${safeText(t("other"))}</option>
            </select>
          </div>
          <div class="field">
            <label>${safeText(t("describe_problem"))}</label>
            <textarea name="description" required placeholder="${safeText(t("ticket_placeholder"))}"></textarea>
          </div>
          <div class="button-row">
            <button class="primary-button" type="submit">${safeText(t("create_ticket"))}</button>
            <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("cancel"))}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderPaymentFormModal() {
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);
  return `
    <div class="modal-overlay" data-close-modal="true">
      <div class="modal-card small" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">${safeText(t("make_payment_title"))}</h2>
            <p class="section-copy">${safeText(t("payment_modal_copy"))}</p>
          </div>
          <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("close"))}</button>
        </div>
        <form id="payment-form" class="form-grid">
          <div class="field">
            <label>${safeText(t("amount"))}</label>
            <input name="amount" type="number" min="0" step="0.01" value="${safeText(lease?.terms.monthlyCost || "")}" required>
          </div>
          <div class="field">
            <label>${safeText(t("description"))}</label>
            <input name="description" value="${safeText(t("monthly_rent"))}" required>
          </div>
          <div class="field">
            <label>${safeText(t("method"))}</label>
            <select name="method" required>
              <option value="Card via Stripe">Card via Stripe</option>
              <option value="ACH via Stripe">ACH via Stripe</option>
            </select>
          </div>
          <div class="inline-note">
            ${safeText(t("payment_architecture_note"))}
          </div>
          <div class="button-row">
            <button class="primary-button" type="submit">${safeText(t("record_payment"))}</button>
            <button class="ghost-button" type="button" data-action="close-modal">${safeText(t("cancel"))}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function bindWelcomeEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      setState((draft) => {
        draft.ui.authRole = button.dataset.role;
        draft.ui.loginError = "";
      });
    });
  });

  document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const role = state.ui.authRole;

    try {
      const serverResult = await tryServerLogin({ email, password, role });
      if (serverResult?.user && serverResult?.data) {
        setState((draft) => {
          draft.data = serverResult.data;
          draft.session.role = serverResult.user.role;
          draft.session.userId = serverResult.user.id;
          draft.session.page = serverResult.user.role === "admin" ? "home" : "profile";
          draft.ui.loginError = "";
          draft.ui.flash = "";
        });
        return;
      }
    } catch (error) {
      setState((draft) => {
        draft.ui.loginError = error instanceof Error ? error.message : t("login_error");
      });
      return;
    }

    const user = state.data.users.find(
      (entry) => entry.role === role && entry.email.toLowerCase() === email && entry.password === password
    );

    setState((draft) => {
      if (!user) {
        draft.ui.loginError = t("login_error");
        return;
      }

      draft.session.role = role;
      draft.session.userId = user.id;
      draft.session.page = role === "admin" ? "home" : "profile";
      draft.ui.loginError = "";
      draft.ui.flash = "";
    });
  });
}

function bindPortalEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      setState((draft) => {
        draft.session.page = button.dataset.page;
        if (button.dataset.page !== "payments") draft.ui.paymentLeaseFilter = null;
        draft.ui.flash = "";
      });
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });

  document.querySelectorAll("[data-close-modal='true']").forEach((overlay) => {
    overlay.addEventListener("click", () => closeModal());
  });

  document.getElementById("tenant-profile-form")?.addEventListener("submit", handleTenantProfileSave);
  document.getElementById("lease-form")?.addEventListener("submit", handleLeaseSave);
  document.getElementById("ticket-form")?.addEventListener("submit", handleTicketCreate);
  document.getElementById("payment-form")?.addEventListener("submit", handlePaymentCreate);
}

function handleAction(action, id) {
  switch (action) {
    case "logout":
      setState((draft) => {
        draft.session = { role: null, userId: null, page: "welcome" };
        draft.ui.modal = null;
        draft.ui.flash = "";
        draft.ui.paymentLeaseFilter = null;
      });
      break;
    case "set-language":
      setState((draft) => {
        draft.ui.language = id || "en";
      });
      break;
    case "open-create-lease":
      setState((draft) => {
        draft.ui.modal = { type: "lease-form", leaseId: null };
      });
      break;
    case "edit-lease":
      setState((draft) => {
        draft.ui.modal = { type: "lease-form", leaseId: id };
      });
      break;
    case "delete-lease":
      openConfirm(
        t("delete_lease"),
        t("delete_lease_copy"),
        () => deleteLease(id)
      );
      break;
    case "lease-payments":
      setState((draft) => {
        draft.session.page = "payments";
        draft.ui.paymentLeaseFilter = id;
      });
      break;
    case "clear-payment-filter":
      setState((draft) => {
        draft.ui.paymentLeaseFilter = null;
      });
      break;
    case "open-ticket-view":
      setState((draft) => {
        draft.ui.modal = { type: "ticket-view", ticketId: id };
      });
      break;
    case "toggle-ticket":
      toggleTicketStatus(id);
      break;
    case "delete-ticket":
      openConfirm(
        t("delete"),
        t("delete_ticket_copy"),
        () => deleteTicket(id)
      );
      break;
    case "open-ticket-create":
      setState((draft) => {
        draft.ui.modal = { type: "ticket-form" };
      });
      break;
    case "make-payment":
      setState((draft) => {
        draft.ui.modal = { type: "payment-form" };
      });
      break;
    case "close-modal":
      closeModal();
      break;
    case "confirm-modal":
      state.ui.modal?.onConfirm?.();
      break;
    case "add-derivative":
      addLeaseFieldRow("derivative");
      break;
    case "remove-derivative":
      document.querySelector(`[data-derivative-id="${id}"]`)?.remove();
      break;
    case "add-other-payment":
      addLeaseFieldRow("other-payment");
      break;
    case "remove-other-payment":
      document.querySelector(`[data-other-payment-id="${id}"]`)?.remove();
      break;
    default:
      break;
  }
}

function addLeaseFieldRow(type) {
  if (type === "derivative") {
    const host = document.getElementById("derivative-list");
    host.insertAdjacentHTML("beforeend", renderDerivativeInputs({ id: uid("der"), firstName: "", lastName: "" }));
    return;
  }

  const host = document.getElementById("other-payment-list");
  host.insertAdjacentHTML(
    "beforeend",
    renderOtherPaymentInputs({ id: uid("other"), amount: "", description: "" })
  );
}

function openConfirm(title, message, onConfirm) {
  setState((draft) => {
    draft.ui.modal = { type: "confirm", title, message, onConfirm };
  });
}

function closeModal() {
  setState((draft) => {
    draft.ui.modal = null;
  });
}

async function handleTenantProfileSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const user = getCurrentUser();

  const email = String(form.get("email") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const password = String(form.get("password") || "").trim();

  try {
    if (window.location.protocol.startsWith("http")) {
      await postJson("/api/update-tenant-profile", {
        userId: user.id,
        email,
        phone,
        password
      });
    }
  } catch (error) {
    setFlash(error instanceof Error ? error.message : t("profile_updated"));
    return;
  }

  setState((draft) => {
    const currentUser = draft.data.users.find((item) => item.id === user.id);
    const lease = draft.data.leases.find((item) => item.principalTenantUserId === user.id);
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.password = password;

    if (lease) {
      lease.principalTenant.email = currentUser.email;
      lease.principalTenant.phone = currentUser.phone;
    }

    draft.ui.flash = t("profile_updated");
  });
}

function handleLeaseSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const leaseId = String(form.get("leaseId") || "").trim();
  const derivatives = Array.from(document.querySelectorAll("[data-derivative-id]"))
    .map((row) => ({
      id: row.dataset.derivativeId,
      firstName: row.querySelector('[name="derivativeFirstName"]').value.trim(),
      lastName: row.querySelector('[name="derivativeLastName"]').value.trim(),
    }))
    .filter((item) => item.firstName || item.lastName);

  const otherPayments = Array.from(document.querySelectorAll("[data-other-payment-id]"))
    .map((row) => ({
      id: row.dataset.otherPaymentId,
      amount: Number(row.querySelector('[name="otherPaymentAmount"]').value || 0),
      description: row.querySelector('[name="otherPaymentDescription"]').value.trim(),
    }))
    .filter((item) => item.amount || item.description);

  const leasePayload = {
    principalTenant: {
      firstName: String(form.get("tenantFirstName") || "").trim(),
      lastName: String(form.get("tenantLastName") || "").trim(),
      phone: String(form.get("tenantPhone") || "").trim(),
      email: String(form.get("tenantEmail") || "").trim(),
    },
    password: String(form.get("tenantPassword") || "").trim(),
    derivatives,
    property: {
      street: String(form.get("street") || "").trim(),
      city: String(form.get("city") || "").trim(),
      state: String(form.get("state") || "").trim(),
      zip: String(form.get("zip") || "").trim(),
      unit: String(form.get("unit") || "").trim(),
      parkingSpaces: String(form.get("parkingSpaces") || "").trim(),
    },
    terms: {
      status: String(form.get("status") || "Active"),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      monthlyCost: Number(form.get("monthlyCost") || 0),
      depositMade: Number(form.get("depositMade") || 0),
      otherPayments,
    },
  };

  setState((draft) => {
    const existingLease = draft.data.leases.find((item) => item.id === leaseId);
    let tenantUser = draft.data.users.find(
      (item) =>
        item.role === "tenant" &&
        ((existingLease && item.id === existingLease.principalTenantUserId) ||
          item.email.toLowerCase() === leasePayload.principalTenant.email.toLowerCase())
    );

    if (!tenantUser) {
      tenantUser = {
        id: uid("user"),
        role: "tenant",
        firstName: leasePayload.principalTenant.firstName,
        lastName: leasePayload.principalTenant.lastName,
        phone: leasePayload.principalTenant.phone,
        email: leasePayload.principalTenant.email,
        password: leasePayload.password,
        leaseId: leaseId || uid("lease"),
      };
      draft.data.users.push(tenantUser);
    } else {
      tenantUser.firstName = leasePayload.principalTenant.firstName;
      tenantUser.lastName = leasePayload.principalTenant.lastName;
      tenantUser.phone = leasePayload.principalTenant.phone;
      tenantUser.email = leasePayload.principalTenant.email;
      tenantUser.password = leasePayload.password;
    }

    const finalLeaseId = leaseId || tenantUser.leaseId || uid("lease");
    tenantUser.leaseId = finalLeaseId;

    const leaseRecord = {
      id: finalLeaseId,
      principalTenantUserId: tenantUser.id,
      principalTenant: leasePayload.principalTenant,
      derivatives: leasePayload.derivatives,
      property: leasePayload.property,
      terms: leasePayload.terms,
    };

    if (existingLease) {
      const index = draft.data.leases.findIndex((item) => item.id === existingLease.id);
      draft.data.leases[index] = leaseRecord;
      draft.data.payments.forEach((payment) => {
        if (payment.leaseId === existingLease.id) payment.tenantUserId = tenantUser.id;
      });
      draft.data.tickets.forEach((ticket) => {
        if (ticket.leaseId === existingLease.id) ticket.tenantUserId = tenantUser.id;
      });
      draft.ui.flash = t("lease_updated");
    } else {
      draft.data.leases.unshift(leaseRecord);
      draft.ui.flash = t("lease_created");
    }

    draft.ui.modal = null;
    draft.session.page = "leases";
  });
}

function deleteLease(leaseId) {
  setState((draft) => {
    const lease = draft.data.leases.find((item) => item.id === leaseId);
    draft.data.leases = draft.data.leases.filter((item) => item.id !== leaseId);
    draft.data.payments = draft.data.payments.filter((item) => item.leaseId !== leaseId);
    draft.data.tickets = draft.data.tickets.filter((item) => item.leaseId !== leaseId);
    if (lease?.principalTenantUserId) {
      draft.data.users = draft.data.users.filter((item) => item.id !== lease.principalTenantUserId);
    }
    draft.ui.modal = null;
    draft.ui.flash = t("lease_removed");
  });
}

async function handleTicketCreate(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);
  const ticketId = uid("ticket");
  const nature = String(form.get("nature") || "");
  const description = String(form.get("description") || "").trim();

  try {
    if (window.location.protocol.startsWith("http")) {
      await postJson("/api/create-ticket", {
        id: ticketId,
        leaseId: lease?.id ?? "",
        tenantUserId: user.id,
        nature,
        description
      });
    }
  } catch (error) {
    setFlash(error instanceof Error ? error.message : t("ticket_submitted"));
    return;
  }

  setState((draft) => {
    draft.data.tickets.unshift({
      id: ticketId,
      leaseId: lease?.id ?? null,
      tenantUserId: user.id,
      nature,
      description,
      status: "Open",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    draft.ui.modal = null;
    draft.ui.flash = t("ticket_submitted");
  });
}

async function toggleTicketStatus(ticketId) {
  const currentTicket = state.data.tickets.find((item) => item.id === ticketId);
  if (!currentTicket) return;
  const nextStatus = currentTicket.status === "Open" ? "Closed" : "Open";

  try {
    if (window.location.protocol.startsWith("http")) {
      await postJson("/api/update-ticket-status", {
        ticketId,
        status: nextStatus
      });
    }
  } catch (error) {
    setFlash(error instanceof Error ? error.message : t("ticket_marked", { status: nextStatus }));
    return;
  }

  setState((draft) => {
    const ticket = draft.data.tickets.find((item) => item.id === ticketId);
    if (!ticket) return;
    ticket.status = nextStatus;
    draft.ui.flash = t("ticket_marked", {
      status: ticket.status === "Open" ? t("open_status") : t("closed_status")
    });
  });
}

async function deleteTicket(ticketId) {
  try {
    if (window.location.protocol.startsWith("http")) {
      await postJson("/api/delete-ticket", { ticketId });
    }
  } catch (error) {
    setFlash(error instanceof Error ? error.message : t("ticket_removed"));
    return;
  }

  setState((draft) => {
    draft.data.tickets = draft.data.tickets.filter((item) => item.id !== ticketId);
    draft.ui.modal = null;
    draft.ui.flash = t("ticket_removed");
  });
}

async function handlePaymentCreate(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const user = getCurrentUser();
  const lease = getLeaseByUser(user.id);

  const amount = Number(form.get("amount") || 0);
  const description = String(form.get("description") || "").trim();
  const method = String(form.get("method") || "Card via Stripe");

  if (state.data.stripe.mode === "live") {
    try {
      await startStripeCheckout({
        leaseId: lease?.id ?? "",
        tenantUserId: user.id,
        amount: Math.round(amount * 100),
        description
      });
      return;
    } catch (error) {
      setFlash(error instanceof Error ? error.message : "Unable to start Stripe Checkout.");
      return;
    }
  }

  const paymentId = uid("pay");

  try {
    if (window.location.protocol.startsWith("http")) {
      await postJson("/api/record-payment", {
        id: paymentId,
        leaseId: lease?.id ?? "",
        tenantUserId: user.id,
        amount,
        description,
        method
      });
    }
  } catch (error) {
    setFlash(error instanceof Error ? error.message : t("payment_recorded"));
    return;
  }

  setState((draft) => {
    draft.data.payments.unshift({
      id: paymentId,
      leaseId: lease?.id ?? null,
      tenantUserId: user.id,
      date: new Date().toISOString().slice(0, 10),
      amount,
      method,
      description,
      status: "Paid",
    });
    draft.ui.modal = null;
    draft.ui.flash = t("payment_recorded");
    draft.session.page = "payments";
  });
}

function fullAddress(property) {
  return `${property.street}, ${property.city}, ${property.state} ${property.zip}, ${property.unit}`;
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  hydrateRelationships(state.data);
  saveState();
  renderApp();
}

async function initializeRuntimeConfig() {
  if (!window.location.protocol.startsWith("http")) return;

  try {
    const response = await fetch("/api/public-config");
    if (!response.ok) return;

    const runtimeConfig = await response.json();
    if (!runtimeConfig?.stripe) return;

    setState((draft) => {
      draft.data.stripe = {
        ...draft.data.stripe,
        ...runtimeConfig.stripe
      };
    });
  } catch (_error) {
    // Ignore missing runtime config so local file previews still work.
  }
}

async function startStripeCheckout(payload) {
  const response = await fetch(state.data.stripe.checkoutEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) {
    throw new Error(result.error || "Unable to start Stripe Checkout.");
  }

  window.location.href = result.url;
}

async function tryServerLogin({ email, password, role }) {
  if (!window.location.protocol.startsWith("http")) return null;

  try {
    const response = await fetch("/api/auth-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || t("login_error"));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(t("login_error"));
  }
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Request failed.");
  }

  return result;
}

window.resetCRHCondosDemo = resetDemoData;

renderApp();
initializeRuntimeConfig();
