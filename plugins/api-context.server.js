export default (context, inject) => {
  // inject("server", () => true);
  inject("api", async (controller, method, params) => {
    try {
      // controller --> user
      // method --> self
      // params --> { id: '5e8619e2bb949346cc52f126' }

      // if (params && params.httpcall) {
      //   return await context.$axios["$" + (params ? "post" : "get")](
      //     "/api/" + controller + "/" + method,
      //     params
      //   );
      // }

      let api = require("../server/api/" + controller.replace(/^\/+|\/+$|\.+/g, ""))
      return await api[method](params)
    } catch (e) {
      console.error(e)
      throw e
    }
  })
}
