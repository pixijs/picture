var myPlugin = {
    PictureSprite: require('./PictureSprite'),
    PictureRenderer: require('./PictureRenderer')
};

//dump everything into extras

Object.assign(PIXI.extras, myPlugin);

module.exports = myPlugin;
