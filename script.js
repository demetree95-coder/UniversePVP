const copyButtons = document.querySelectorAll("[data-copy]");
const toast = document.getElementById("toast");

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
};

const ACCOUNTS_KEY = "universepvp_accounts";
const SESSION_KEY = "universepvp_session";
const LEGACY_ACCOUNT_KEY = "universepvp_account";

const normalize = (value) => String(value || "").trim().toLowerCase();

const loadAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const saveAccounts = (accounts) => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    // ignore
  }
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    // ignore
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    // ignore
  }
};

const migrateLegacyAccount = () => {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_ACCOUNT_KEY);
    if (!legacyRaw) return;
    const legacy = JSON.parse(legacyRaw);
    if (!legacy || !legacy.username || !legacy.email) return;
    const accounts = loadAccounts();
    const exists = accounts.some(
      (acc) =>
        normalize(acc.username) === normalize(legacy.username) ||
        normalize(acc.email) === normalize(legacy.email)
    );
    if (!exists) {
      accounts.push(legacy);
      saveAccounts(accounts);
    }
    localStorage.removeItem(LEGACY_ACCOUNT_KEY);
  } catch (err) {
    // ignore
  }
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    const success = document.execCommand("copy");
    document.body.removeChild(temp);
    return success;
  }
};

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      const original = button.textContent;
      button.textContent = "Copied";
      showToast("IP copied");
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    }
  });
});

migrateLegacyAccount();

const filterButtons = document.querySelectorAll("[data-filter]");
const storeCards = document.querySelectorAll(".store-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    storeCards.forEach((card) => {
      const categories = card.dataset.category ? card.dataset.category.split(" ") : [];
      const visible = filter === "all" || categories.includes(filter);
      card.style.display = visible ? "block" : "none";
    });
  });
});

const packageSelect = document.getElementById("payment-pack");
const summaryItem = document.getElementById("summary-item");
const summaryTotal = document.getElementById("summary-total");
const summaryMethod = document.getElementById("summary-method");
const summaryAccount = document.getElementById("summary-account");
const paymentForm = document.getElementById("payment-form");
const paymentLinked = document.getElementById("payment-linked");
const paymentIgn = document.getElementById("payment-ign");
const paymentEmail = document.getElementById("payment-email");
const loginStatus = document.getElementById("login-status");
const accountStatus = document.getElementById("account-status");
const accountUser = document.getElementById("account-user");
const accountEmail = document.getElementById("account-email");
const logoutButton = document.getElementById("logout-btn");
const accountChip = document.getElementById("account-chip");
const accountChipName = document.getElementById("account-chip-name");
const chipLogout = document.getElementById("chip-logout");

const formatPrice = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return `$${value}`;
  return `$${numberValue % 1 === 0 ? numberValue.toFixed(0) : numberValue.toFixed(2)}`;
};

const updateSummary = (name, price) => {
  if (summaryItem && name) {
    summaryItem.textContent = name;
  }
  if (summaryTotal && price != null) {
    summaryTotal.textContent = formatPrice(price);
  }
};

const updateSummaryFromSelect = () => {
  if (!packageSelect) return;
  const option = packageSelect.selectedOptions[0];
  if (!option) return;
  updateSummary(option.value, option.dataset.price);
};

const applyAccountUI = (session) => {
  const loggedIn = !!(session && session.user);
  if (accountStatus) {
    accountStatus.textContent = loggedIn ? "Logged in" : "Not logged in";
  }
  if (accountUser) {
    accountUser.textContent = loggedIn ? session.user : "-";
  }
  if (accountEmail) {
    accountEmail.textContent = loggedIn && session.email ? session.email : "-";
  }
  if (logoutButton) {
    logoutButton.disabled = !loggedIn;
  }
  if (accountChip) {
    accountChip.classList.toggle("visible", loggedIn);
  }
  if (accountChipName) {
    accountChipName.textContent = loggedIn ? session.user : "Guest";
  }
  if (summaryAccount) {
    summaryAccount.textContent = loggedIn ? session.user : "Not linked";
  }
  if (loginStatus) {
    loginStatus.textContent = loggedIn ? `Logged in as ${session.user}` : "Not logged in";
  }
  if (paymentLinked) {
    paymentLinked.textContent = loggedIn
      ? `Account: ${session.user}`
      : "Account: Not linked";
  }
  if (loggedIn) {
    if (paymentIgn && !paymentIgn.value) {
      paymentIgn.value = session.user;
    }
    if (paymentEmail && session.email && !paymentEmail.value) {
      paymentEmail.value = session.email;
    }
  }
};

if (packageSelect) {
  updateSummaryFromSelect();
  packageSelect.addEventListener("change", updateSummaryFromSelect);
}

const methodCards = document.querySelectorAll(".method-card");
methodCards.forEach((card) => {
  card.addEventListener("click", () => {
    methodCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    if (summaryMethod) {
      summaryMethod.textContent = card.dataset.method || "Card";
    }
  });
});

const purchaseButtons = document.querySelectorAll("[data-purchase]");
purchaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-product]");
    if (!card) return;
    const name = card.dataset.product;
    const price = card.dataset.price;

    if (packageSelect) {
      const hasOption = Array.from(packageSelect.options).some((opt) => opt.value === name);
      if (hasOption) {
        packageSelect.value = name;
      }
    }

    updateSummary(name, price);

    const session = loadSession();
    if (!session) {
      showToast("Login or register to link account.");
    } else {
      applyAccountUI(session);
    }

    if (paymentForm) {
      paymentForm.classList.remove("flash");
      void paymentForm.offsetWidth;
      paymentForm.classList.add("flash");
    }

    const paymentsSection = document.getElementById("payments");
    if (paymentsSection) {
      paymentsSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});

const activeMethod = document.querySelector(".method-card.active");
if (summaryMethod && activeMethod) {
  summaryMethod.textContent = activeMethod.dataset.method || "Card";
}

const handleLogout = () => {
  clearSession();
  applyAccountUI(null);
  showToast("Logged out.");
  if (loginStatus) {
    loginStatus.textContent = "Not logged in";
  }
  if (paymentIgn) paymentIgn.value = "";
  if (paymentEmail) paymentEmail.value = "";
};

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

if (chipLogout) {
  chipLogout.addEventListener("click", handleLogout);
}

applyAccountUI(loadSession());

const authTabs = document.querySelectorAll(".auth-tab");
const authSwitches = document.querySelectorAll(".link-button[data-auth]");
const authPanes = document.querySelectorAll("[data-auth-pane]");

const setAuthPane = (target) => {
  if (!target) return;
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.auth === target);
  });
  authPanes.forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.authPane === target);
  });
};

if (authPanes.length) {
  const defaultAuth = "register";
  setAuthPane(defaultAuth);
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => setAuthPane(tab.dataset.auth));
  });
  authSwitches.forEach((button) => {
    button.addEventListener("click", () => setAuthPane(button.dataset.auth));
  });
}

const registerButton = document.querySelector("[data-register-btn]");
const loginButton = document.querySelector("[data-login-btn]");
if (registerButton) {
  registerButton.addEventListener("click", () => {
    const regUser = document.getElementById("reg-user");
    const regEmail = document.getElementById("reg-email");
    const regPass = document.getElementById("reg-pass");
    const regPassConfirm = document.getElementById("reg-pass-confirm");
    const regAgree = document.querySelector(".register-card .checkbox input");

    const username = regUser ? regUser.value.trim() : "";
    const email = regEmail ? regEmail.value.trim() : "";
    const password = regPass ? regPass.value : "";
    const confirm = regPassConfirm ? regPassConfirm.value : "";
    const agreed = regAgree ? regAgree.checked : false;

    if (!username || !email || !password || !confirm) {
      showToast("Please fill all fields.");
      return;
    }

    if (password !== confirm) {
      showToast("Passwords do not match.");
      return;
    }

    if (!agreed) {
      showToast("Please accept the store rules.");
      return;
    }

    const accounts = loadAccounts();
    const duplicate = accounts.some(
      (acc) =>
        normalize(acc.username) === normalize(username) ||
        normalize(acc.email) === normalize(email)
    );
    if (duplicate) {
      showToast("Username or email already exists.");
      return;
    }

    const account = { username, email, password };
    accounts.push(account);
    saveAccounts(accounts);

    const session = { user: account.username, email: account.email, time: Date.now() };
    saveSession(session);
    applyAccountUI(session);

    showToast("Account created!");
    if (regPass) regPass.value = "";
    if (regPassConfirm) regPassConfirm.value = "";
    setAuthPane("login");

    const loginUser = document.getElementById("login-user");
    if (loginUser && !loginUser.value) {
      loginUser.value = username;
    }
    const loginPass = document.getElementById("login-pass");
    if (loginPass && !loginPass.value) {
      loginPass.value = password;
    }
    if (loginStatus) {
      loginStatus.textContent = "Account created. Please login.";
    }
  });
}

if (loginButton) {
  loginButton.addEventListener("click", () => {
    const loginUser = document.getElementById("login-user");
    const loginPass = document.getElementById("login-pass");
    const loginId = loginUser ? loginUser.value.trim() : "";
    const loginPwd = loginPass ? loginPass.value : "";

    if (!loginId || !loginPwd) {
      showToast("Enter username and password.");
      if (loginStatus) {
        loginStatus.textContent = "Missing login details.";
      }
      return;
    }

    const accounts = loadAccounts();
    const account = accounts.find(
      (acc) =>
        normalize(acc.username) === normalize(loginId) ||
        normalize(acc.email) === normalize(loginId)
    );
    if (!account) {
      showToast("No account found. Please register.");
      if (loginStatus) {
        loginStatus.textContent = "No account found.";
      }
      setAuthPane("register");
      return;
    }

    if (loginPwd !== account.password) {
      showToast("Wrong username or password.");
      if (loginStatus) {
        loginStatus.textContent = "Login failed.";
      }
      return;
    }

    const session = { user: account.username, email: account.email, time: Date.now() };
    saveSession(session);
    applyAccountUI(session);

    showToast("Logged in!");
    if (loginStatus) {
      loginStatus.textContent = `Logged in as ${account.username}`;
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}
