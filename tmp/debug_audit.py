from api.models import AuditLog
try:
    log = AuditLog.objects.create(action='login', severity='LOW', source='SYSTEM')
    print(f"SUCCESS! Created ID: {log.id}")
except Exception as e:
    import traceback
    print(f"FAILED! Error: {e}")
    traceback.print_exc()
