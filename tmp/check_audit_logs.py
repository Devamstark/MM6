from api.models import AuditLog
print(f"AuditLog Count: {AuditLog.objects.count()}")
for log in AuditLog.objects.all()[:5]:
    print(f"Log: {log.action} | {log.severity}")
