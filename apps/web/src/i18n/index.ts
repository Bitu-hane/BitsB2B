import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enCatalog from './en/catalog.json';
import enOrders from './en/orders.json';
import enCommon from './en/common.json';

import amAuth from './am/auth.json';
import amDashboard from './am/dashboard.json';
import amCatalog from './am/catalog.json';
import amOrders from './am/orders.json';
import amCommon from './am/common.json';

export const enTranslations = {
  auth: enAuth,
  dashboard: enDashboard,
  catalog: enCatalog,
  orders: enOrders,
  common: enCommon,
};

export const amTranslations = {
  auth: amAuth,
  dashboard: amDashboard,
  catalog: amCatalog,
  orders: amOrders,
  common: amCommon,
};

export default {
  en: enTranslations,
  am: amTranslations,
};
