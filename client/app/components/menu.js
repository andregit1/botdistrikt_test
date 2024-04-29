import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MenuComponent extends Component {
  @service router;

  // get productImage() {
  //   const { image } = this.args.product.colors.find(({
  //     color
  //   }) => color === this.color);
  //   return image;
  // }
}
