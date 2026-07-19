import json
import pytest
from app.models.job import JobStatus, JobCategory

def test_create_job(client, auth_headers, test_user):
    """Test job creation"""
    response = client.post('/api/jobs/', json={
        'category': 'plumbing',
        'title': 'Fix bathroom pipe',
        'description': 'The bathroom pipe is leaking and needs urgent repair',
        'address': '45 Allen Avenue, Ikeja, Lagos',
        'lat': 6.5244,
        'lng': 3.3792,
        'estimated_price': 25000
    }, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert 'job_id' in data['data']

def test_list_jobs(client):
    """Test job listing"""
    response = client.get('/api/jobs/')
    assert response.status_code == 200
    data = response.get_json()
    assert 'jobs' in data['data']
    assert isinstance(data['data']['jobs'], list)