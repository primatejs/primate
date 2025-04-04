def get(request):
    return Primate.view("index.html", {"hello" : "world"});
