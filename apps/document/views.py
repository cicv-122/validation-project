from django.shortcuts import render
from django.views.generic import ListView
from django.utils.translation import gettext_lazy as _

from apps.document import models


class ProfStandardListView(ListView):
    model = models.ProfStandard
    context_object_name = 'documents'
    queryset = model.objects.filter(is_active=True)
    template_name = 'base_document.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _('Проф. стандарты')
        return context


class DevelopmentPartnerListView(ListView):
    model = models.DevelopmentPartner
    context_object_name = 'documents'
    queryset = model.objects.filter(is_active=True)
    template_name = 'base_document.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _('Партнеры по развитию')
        return context


class AssessmentCenterListView(ListView):
    model = models.AssessmentCenter
    context_object_name = 'assessments'
    queryset = model.objects.filter(is_active=True)
    template_name = 'assessment_centers.html'


class AppraisersExpertListView(ListView):
    model = models.AssessmentCenter
    context_object_name = 'assessments'
    queryset = model.objects.filter(is_active=True).prefetch_related('assessment_centers')
    template_name = 'appraisers_experts.html'


class CertifiedUserListView(ListView):
    model = models.CertifiedUser
    context_object_name = 'certified_users'
    template_name = 'certified_users.html'
