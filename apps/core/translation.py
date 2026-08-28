from modeltranslation.translator import register, TranslationOptions
from .models import ManagementMember

@register(ManagementMember)
class ManagementMemberTranslation(TranslationOptions):
    fields = ('full_name', 'position', 'description')
