require 'rubygems'
require 'sinatra'
require 'haml'

get '/index' do
  "Hello index."
end

# Handle GET-request (Show the upload form)
get "/upload" do
  haml :upload
end      
    
# Handle POST-request (Receive and save the uploaded file)
post "/upload" do
  p params
  File.open('uploads/' + params['myfile'][:filename], "w") do |f|
    f.write(params['myfile'][:tempfile].read)
  end
  params['myfile'][:filename]
end

get '/images/:picture' do
  send_file File.join('uploads', params[:picture]), :type => :jpg
end


post '/login' do
  puts params[:username]
  password = params[:password]
  puts password
  if password == "password"
    "ok"
  else
    "error"
  end
end

get '/hello/:name' do
  "Hello #{params[:name]}!"
end