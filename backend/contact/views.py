import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage

@csrf_exempt
def contact_view(request):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        message = (data.get("message") or "").strip()

        if not name or not email or not message:
            return JsonResponse({"ok": False, "error": "Campos incompletos"}, status=400)

        to_addr = getattr(settings, "CONTACT_TO_EMAIL", "") or ""
        from_addr = getattr(settings, "DEFAULT_FROM_EMAIL", "") or settings.EMAIL_HOST_USER or ""

        if not to_addr:
            return JsonResponse({"ok": False, "error": "CONTACT_TO_EMAIL no configurado."}, status=500)
        if not from_addr:
            return JsonResponse({"ok": False, "error": "DEFAULT_FROM_EMAIL/EMAIL_HOST_USER no configurado."}, status=500)

        subject = f"[Contacto] {name}"
        body = f"Nombre: {name}\nCorreo: {email}\n\nMensaje:\n{message}"

        mail = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_addr,
            to=[to_addr],
            reply_to=[email] if email else None,
        )
        sent = mail.send(fail_silently=False)  # 1 si se envió
        return JsonResponse({"ok": sent == 1, "sent": sent})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)
