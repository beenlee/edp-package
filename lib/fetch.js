/**
 * @file 包获取功能
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 创建request
 * 
 * @inner
 * @param {string} url 远程包URL
 * @return {HttpRequest}
 */
function createRequest( url ) {
    url = require( 'url' ).parse( url );
    
    var pkgFile = require( 'path' ).resolve( __dirname, '..', 'package.json' )
    var pkgInfo = JSON.parse( require( 'fs' ).readFileSync( pkgFile, 'UTF-8' ) );
    var opt = {
        url: url,
        strictSSL: false,
        headers: { 'user-agent': 'EdpPackage/' + pkgInfo.version }
    };

    return require( 'request' )( opt );
}

/**
 * 获取包
 * 
 * @param {string} name 包名称
 * @param {string} toDir 要放到的目录下
 * @param {Function} callback 回调函数
 */
function fetch( name, toDir, callback ) {
    callback = callback || function () {};

    var part = name.split( '@' );
    name = part[ 0 ];
    var version = part[ 1 ];

    var mkdir = require( 'mkdirp' );
    mkdir.sync( toDir );

    var registry = require( './util/get-registry' )();
    registry.get(
        name,
        function ( error, data ) {
            if ( error ) {
                callback( error, data );
                return;
            }

            var versions = Object.keys( data.versions || {} );
            var ver = require( 'semver' ).maxSatisfying( versions, version );

            if ( !ver ) {
                console.log( 'No matched version!' );
                return;
            }

            registry.get( 
                name + '/' + ver,
                function ( error, data ) {
                    if ( error ) {
                        throw error;
                    }

                    var fs = require( 'fs' );
                    var path = require( 'path' );
                    var shasum = data.dist.shasum;
                    var tarball = data.dist.tarball;
                    var file = tarball.slice( tarball.lastIndexOf( '/' ) + 1 );
                    var fullPath = path.resolve( toDir, './' + file );

                    var stream = fs.createWriteStream( fullPath );
                    var request = createRequest( tarball );
                    request.on( 'error', function ( error ) {
                        stream.emit( 'error', error );
                    } );
                    request.pipe( stream );

                    var response;
                    request.on( 'response', function ( res ) {
                        response = res;
                        response.resume();
                    } );

                    stream.on( 'close', function () {
                        require( './util/check-sha' )( 
                            fullPath, 
                            shasum, 
                            function ( error ) {
                                callback( error, {
                                    file: file,
                                    path: fullPath,
                                    version: ver,
                                    name: name,
                                    shasum: shasum
                                } );
                            } 
                        );
                    } );
                }
            );
        }
    );
}


module.exports = exports = fetch;


