module.exports = async ( ctx ) => {
    const title = 'home'
    await ctx.render('index.html', {
      title
    })
  }