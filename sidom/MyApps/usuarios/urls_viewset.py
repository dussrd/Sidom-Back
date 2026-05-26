from django.urls import path
from rest_framework.routers import DefaultRouter
from MyApps.usuarios.views_viewset import (
    ClienteViewSet,
    DomiciliarioViewSet,
    UsuarioViewSet,
    LoginView,
    RegistroView,
)

router = DefaultRouter()
router.register(r'clientes',     ClienteViewSet)
router.register(r'domiciliarios', DomiciliarioViewSet)
router.register(r'usuarios',     UsuarioViewSet)

urlpatterns = router.urls + [
    path('login/',    LoginView.as_view(),    name='login'),
    path('registro/', RegistroView.as_view(), name='registro'),
]
