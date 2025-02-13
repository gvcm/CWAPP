require 'rack'

use Rack::Static,
  urls: ['/Images', '/scripts', '/sounds', '/styles', '/vendor'],
  root: './'

run lambda { |env|
  file = 'index.html'

  if File.exist?(file)
    [
      200,
      {
        'content-type'  => 'text/html',  # Changed to lowercase
        'cache-control' => 'public, max-age=86400'
      },
      [File.read(file)]
    ]
  else
    [
      404,
      { 'content-type' => 'text/plain' },  # Changed to lowercase
      ["File not found"]
    ]
  end
}

