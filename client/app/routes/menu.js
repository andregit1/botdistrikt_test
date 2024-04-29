import Route from '@ember/routing/route';

export default class MenuRoute extends Route {
  async model() {
    const response = await fetch('http://localhost:3000/api/menu-items');
    const { data: menuItems } = await response.json();
    return menuItems;
  }
}
