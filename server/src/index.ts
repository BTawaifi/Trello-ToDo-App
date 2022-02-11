import server from './server';

try {
    server();
} catch (error:any) {
        console.log(error);
}

 process.on('uncaughtException', (error: any) => {
    //console.log(error);
    if (error.code == 'EADDRINUSE') {
        process.exit(300); 
    }
    else if (error.code == 'ECONNREFUSED') {
        console.log('ECONNREFUSED');
    }
    else {
        process.exit(1);
    }
});
 