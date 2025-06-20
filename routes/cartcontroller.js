const Cart = require('../routes/cart');

// Add a recipe to the cart
exports.addToCart = async (req, res) => {
  const { user_id, recipe_id, cart_quantity } = req.body;

  if (!user_id || !recipe_id) {
    return res.status(400).send('User ID and Recipe ID are required.');
  }

  try {
    // Check if the cart item alreasdy exists
    const existingCartItem = await Cart.findOne({ where: { user_id, recipe_id } });

    if (existingCartItem) {
      // Update the quantity
      existingCartItem.cart_quantity += cart_quantity;
      await existingCartItem.save();
      return res.status(200).json(existingCartItem);
    } else {
      // Create a new cart item
      const newCartItem = await Cart.create({
        user_id,
        recipe_id,
        cart_quantity: cart_quantity || 1,
      });
      return res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).send('Internal Server Error');
  }
};

// Get all cart items for a specific user
exports.getCartItems = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cartItems = await Cart.findAll({
      where: { user_id },
      include: [{
        model: Recipe,
        attributes: ['recipe_id', 'name', 'price', 'image_url'],
      }],
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).send('Internal Server Error');
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { user_id, recipe_id } = req.params;
  const { cart_quantity } = req.body;

  try {
    const cartItem = await Cart.findOne({ where: { user_id, recipe_id } });

    if (!cartItem) {
      return res.status(404).send('Cart item not found.');
    }

    cartItem.cart_quantity = cart_quantity;
    await cartItem.save();

    return res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).send('Internal Server Error');
  }
};

// Remove a cart item
exports.removeCartItem = async (req, res) => {
  const { user_id, recipe_id } = req.params;

  try {
    const cartItem = await Cart.findOne({ where: { user_id, recipe_id } });

    if (!cartItem) {
      return res.status(404).send('Cart item not found.');
    }

    await cartItem.destroy();
    return res.status(200).send('Cart item removed successfully.');
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).send('Internal Server Error');
  }
};
