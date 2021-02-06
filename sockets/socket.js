const { validationResult } = require('express-validator');
const { comprobarJWT } = require('../helpers/jwt');
const {io} = require('../index');
const {usuarioConectado, usuarioDesonectado, grabarMensaje} = require('../controllers/socket')

//Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');
    const [valido, uid] = comprobarJWT(client.handshake.headers['x-token']);
    console.log(uid);

    //Verificar la autenticación
    if (!valido) {return client.disconnect();}

    //Cliente autenticado
    usuarioConectado(uid);

    //Ingresar al usuario a una sala particular
    //Sala global, cliente.id, 60109b80c5162203b0398364
    client.join(uid);

    //Escuchar del cliente el mensaje-personal
    client.on('mensaje-personal', async (payload) => {
        //TODO: Grabar mensaje
        await grabarMensaje(payload);
        io.to(payload.para).emit('mensaje-personal', payload);
    })
    
    client.on('disconnect', () => { 
        usuarioDesonectado(uid);
     });

    // client.on('mensaje', (payload) => {
    //     console.log('Mensaje', payload);

    //     io.emit('mensaje', {admin: 'Nuevo mensaje'});
    // });
});