export default (context, inject) => {
  inject("api", async (controller, method, params) => {
    try {
      // controller --> user
      // method --> self
      // params --> { id: '5e8619e2bb949346cc52f126' }

      // return await context.$axios["$" + (params ? "post" : "get")](
      //   "/api/" + controller + "/" + method,
      //   params
      // )

      return await context.$axios["$get"](`/api/${controller}/${method}/${params.id}`) 
    } catch (e) {
      console.error(e)
      throw e
    }
  })
}