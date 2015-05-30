from django.http import HttpResponse
from ironcat import photon
import re
import traceback

def json_response(data, status=200):
    serialized_data = photon.serialize(data)
    result = HttpResponse(serialized_data, content_type='application/json', status=status)
    return result


def json_success(data=None, status=200):
    ob = {
        'success': True,
        'error': None
    }
    if data:
        if isinstance(data, dict):
            ob.update(data)
        else:
            ob['result'] = data
    return json_response(ob, status=status)


def json_error(e, data=None, status=200):
    error = str(e)
    print(e)
    ob = {
        'success': False,
        'error': error
    }
    if data:
        ob.update(data)
    return json_response(ob, status=status)



def delete_object(table, request):
    ob_id = request.POST['id']
    ob = table.objects.get(id=ob_id)
    ob.delete()
    return json_success()


def normalize_query(query_string,
                    findterms=re.compile(r'"([^"]+)"|(\S+)').findall,
                    normspace=re.compile(r'\s{2,}').sub):
    return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]


def get_query(query_string, search_fields):
    # Query to search for every search term
    query = None
    terms = normalize_query(query_string)
    for term in terms:
        # Query to search for a given term in each field
        or_query = None
        for field_name in search_fields:
            q = Q(**{'%s__icontains'.format(field_name): term})
            or_query = or_query | q if or_query else q
        query = query & or_query if query else or_query
    return query
