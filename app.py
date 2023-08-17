from flask import Flask,render_template, request, jsonify
import numpy as np
from googleapiclient.discovery import build
import tensorflow as tf
from api_key import api_key
  
app = Flask(__name__,template_folder="templates")
model = tf.keras.models.load_model('newepochs10.h5')
API_KEY = api_key
loaded_model = tf.keras.models.load_model('tmp-model')
vectorizer = loaded_model.layers[0]

@app.route("/")
def hello():
    return render_template('index.html')
  
@app.route('/process_string', methods=['POST'])
def process_string():
    received_data = request.json
    input_string = received_data['inputString']
    
    print("input_string:", input_string)
    # ... similar calculations for other values
    inp = input_string.split('v=')[1]
    inp = inp.split('&')[0]

    video_comments = get_video_comments(API_KEY, inp)
    video_comments = np.array(video_comments)
    print("Extracted comments, Total comments:", len(video_comments))
    toxic=0 
    severe_toxic=0
    obscene=0
    insult=0
    negative=0
    positive=0
    neutral=0

    for co in video_comments:
        try:
            input_text = vectorizer(str(co))
            x = list(model.predict(np.expand_dims(input_text, 0)))
            toxic+=x[0][0]
            severe_toxic+=x[0][1]
            obscene+=x[0][2]
            insult+=x[0][3]
            negative+=x[0][4]
            positive+=x[0][5]
            neutral+=x[0][6]
        except Exception as e:
            print(e)
            pass
    print("Done with predictions")
    per_toxic = (toxic*100)
    per_severe_toxic = (severe_toxic*100)
    per_obscene = (obscene*100)
    per_insult = (insult*100)
    per_negative = (negative*100)
    per_positive = (positive*100)
    per_neutral = (neutral*100)

    per_toxic = (toxic*100)/len(video_comments)
    per_severe_toxic = (severe_toxic*100)/len(video_comments)
    per_obscene = (obscene*100)/len(video_comments)
    per_insult = (insult*100)/len(video_comments)
    per_negative = (negative*100)/len(video_comments)
    per_positive = (positive*100)/len(video_comments)
    per_neutral = (neutral*100)/len(video_comments)
    # Generate the data structure
    data = [
        [
            { 'label': 'toxic', 'value': per_toxic, 'color': '#FF5733' },
            { 'label': 'non_toxic', 'value': 100-per_toxic, 'color': '#66CCFF' }
        ],
        [
            { 'label': 'severe_toxic', 'value': per_severe_toxic, 'color': '#FF5733' },
            { 'label': 'Not severe_toxic', 'value': 100 - per_severe_toxic , 'color': '#66CCFF' }
        ],
        [
            { 'label': 'Obscene', 'value': per_obscene, 'color': '#FF5733' },
            { 'label': 'Not Obscene', 'value': 100-per_obscene, 'color': '#66CCFF' }
        ],
        [
            { 'label': 'Insult', 'value': per_insult, 'color': '#FF5733' },
            { 'label': 'Not Insult', 'value': 100-per_insult, 'color': '#66CCFF' }
        ],
        [
            { 'label': 'negative', 'value': per_negative, 'color': '#FF5733' },
            { 'label': 'Not negative', 'value': 100-per_negative, 'color': '#66CCFF' }
        ],
        [
            { 'label': 'Positive', 'value': per_positive, 'color': '#FF5733' },
            { 'label': 'Not positive', 'value': 100-per_positive, 'color': '#66CCFF' }
        ], 
        [
            { 'label': 'Neutral', 'value': per_neutral, 'color': '#FF5733' },
            { 'label': 'Not Neutral', 'value': 100-per_neutral, 'color': '#66CCFF' }
        ]
    ]

    # Send the data back to JavaScript
    return jsonify(data)



def get_video_comments(api_key, video_id):
    youtube = build("youtube", "v3", developerKey=api_key)

    comments = []
    nextPageToken = None

    while True:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            textFormat="plainText",
            maxResults=100,  # Adjust the number of comments to fetch per request
            pageToken=nextPageToken,
        ).execute()

        for item in response["items"]:
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)

        nextPageToken = response.get("nextPageToken")

        if not nextPageToken:
            break

    return comments
  
if __name__ == '__main__':
    app.run(debug=True)