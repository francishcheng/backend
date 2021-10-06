from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)


@app.route('/save/', methods=['POST'])
def save_record():
    # app.logger.debug(request.files['file'].filename) 
    
    files = request.files
    files = files.getlist('file')
    form = request.form
    clip_names = form.getlist('clipnames')
    # for value in form.poplist():
    #     print(value)
    # print(dir(form))
    # print(form.items())
    # print(form)
    # for ele in list(form):
    #     print(ele)
    # for value in form.values():
    #     print(value)
    # print(names)
    # print(type(file))
    # print(files)
    # print(clip_names)
    # for clip_name, file in zip(clip_names, files):
        # print(file)
        # file.save(clip_name+'.ogg')        
        # with open(clip_name + '.ogg', 'wb') as f:
        #     f.write(file)
    # for file in files:
    #     print(type(file))
    #     print(1)
    # for name in names:
    #     print(name)
    # file.save('hel.ogg')
    for clip_name, file in zip(clip_names, files):
        file.save('./clips/' + clip_name+'.ogg')
    return 'success'

from flask import render_template
@app.route('/')
def hello(name=None):
    return render_template('index.html', name=name)


if __name__=="__main__":
    app.debug=True
    app.run()
    app.run(debug=True)