
/* delete pizza menu */
router.delete("/menu/id/:id", async function (req, res, next) {
  try {
    let { id } = req.params;

    // Find and delete pizza menu
    const pizzaMenu = await pizzaSchema.findById(id);
    if (!pizzaMenu) {
      return sendResponse(res, 400, "Unsuccess, this menu not found", []);
    }
    let delMenu = await pizzaSchema.findByIdAndDelete(id, { id });
    return sendResponse(res, 200, "success", delMenu);
  } catch (error) {
    console.error("error ", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
});