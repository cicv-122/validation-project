from modeltranslation.translator import register, TranslationOptions
from .models import DevelopmentPartner, ProfStandard, AppraisersExpert, AssessmentCenter, AssessmentCenterDirector

@register(DevelopmentPartner)
class DevelopmentPartnerTranslationOptions(TranslationOptions):
    fields = ('title', 'description', 'address')

@register(ProfStandard)
class ProfStandardTranslationOptions(TranslationOptions):
    fields = ('title', 'file')

@register(AppraisersExpert)
class AppraisersExpertTranslationOptions(TranslationOptions):
    fields = ('profession', 'appraisers', 'appraiser_employer', 'consultant')

@register(AssessmentCenter)
class AssessmentCenterTranslationOptions(TranslationOptions):
    fields = ('organization', 'address')

@register(AssessmentCenterDirector)
class AssessmentCenterDirectorTranslationOptions(TranslationOptions):
    fields = ('name',)
