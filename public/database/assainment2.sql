INSERT INTO public.account VALUES (account_firstname='Tony', account_lastname='Stark', account_email='tony@starkent.com', account_password='Iam1ronM@n');
UPDATE public.account SET account_type='Admin' WHERE account_firstname='Tony' AND account_lastname='Stark';
DELETE FROM public.account WHERE account_firstname='Tony' AND account_lastname='Stark';
UPDATE public.inventory SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior') WHERE inv_make = 'GM' AND inv_model = 'Hummer';
SELECT inv_make, inv_model, classification_name FROM  public.inventory INNER JOIN public.classification ON public.inventory.classification_id = public.classification.classification_id WHERE classification_name = 'Sport';
UPDATE public.inventory SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'), inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
