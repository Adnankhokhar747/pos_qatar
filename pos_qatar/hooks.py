app_name = "pos_qatar"
app_title = "POS Qatar"
app_publisher = "Globcom Qatar"
app_description = "Point of Sales Qatar"
app_email = "info@globcomqatar.com"
app_license = "mit"

# Fixtures
# ------------------
# Roles and POS Profile custom fields shipped with the app

fixtures = [
	{"doctype": "Role", "filters": [["name", "in", ["POS Cashier", "POS Supervisor", "POS Manager"]]]},
	{"doctype": "Custom Field", "filters": [["dt", "=", "POS Profile"], ["fieldname", "like", "pq_%"]]},
]

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "pos_qatar",
# 		"logo": "/assets/pos_qatar/logo.png",
# 		"title": "POS Qatar",
# 		"route": "/pos_qatar",
# 		"has_permission": "pos_qatar.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/pos_qatar/css/pos_qatar.css"
# app_include_js = "/assets/pos_qatar/js/pos_qatar.js"

# include js, css files in header of web template
# web_include_css = "/assets/pos_qatar/css/pos_qatar.css"
# web_include_js = "/assets/pos_qatar/js/pos_qatar.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "pos_qatar/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "pos_qatar/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "pos_qatar.utils.jinja_methods",
# 	"filters": "pos_qatar.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "pos_qatar.install.before_install"
# after_install = "pos_qatar.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "pos_qatar.uninstall.before_uninstall"
# after_uninstall = "pos_qatar.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "pos_qatar.utils.before_app_install"
# after_app_install = "pos_qatar.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "pos_qatar.utils.before_app_uninstall"
# after_app_uninstall = "pos_qatar.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "pos_qatar.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"pos_qatar.tasks.all"
# 	],
# 	"daily": [
# 		"pos_qatar.tasks.daily"
# 	],
# 	"hourly": [
# 		"pos_qatar.tasks.hourly"
# 	],
# 	"weekly": [
# 		"pos_qatar.tasks.weekly"
# 	],
# 	"monthly": [
# 		"pos_qatar.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "pos_qatar.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "pos_qatar.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "pos_qatar.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["pos_qatar.utils.before_request"]
# after_request = ["pos_qatar.utils.after_request"]

# Job Events
# ----------
# before_job = ["pos_qatar.utils.before_job"]
# after_job = ["pos_qatar.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"pos_qatar.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

